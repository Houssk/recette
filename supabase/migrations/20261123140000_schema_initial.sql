-- Recette V1 : schéma initial (sans connexion, URL partagée en interne)
create type public.gravite as enum ('bloquante', 'majeure', 'mineure');
create type public.statut as enum ('nouvelle', 'en_cours', 'corrigee', 'verifiee');

create table public.anomalies (
  id uuid primary key default gen_random_uuid(),
  numero bigint generated always as identity unique,
  titre text not null check (char_length(titre) between 3 and 200),
  gravite public.gravite not null,
  etapes text not null check (char_length(etapes) between 1 and 5000),
  attendu text not null check (char_length(attendu) between 1 and 2000),
  obtenu text not null check (char_length(obtenu) between 1 and 2000),
  statut public.statut not null default 'nouvelle',
  auteur text not null check (char_length(auteur) between 1 and 100),
  cree_le timestamptz not null default now(),
  maj_le timestamptz not null default now()
);
create index anomalies_cree_le_idx on public.anomalies (cree_le desc);

create table public.captures (
  id uuid primary key default gen_random_uuid(),
  anomalie_id uuid not null references public.anomalies (id) on delete cascade,
  chemin text not null unique check (chemin ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp)$'),
  cree_le timestamptz not null default now()
);
create index captures_anomalie_idx on public.captures (anomalie_id);

create table public.historique (
  id bigint generated always as identity primary key,
  anomalie_id uuid not null references public.anomalies (id) on delete cascade,
  ancien public.statut,
  nouveau public.statut not null,
  commentaire text check (commentaire is null or char_length(commentaire) <= 2000),
  auteur text not null check (char_length(auteur) between 1 and 100),
  cree_le timestamptz not null default now()
);
create index historique_anomalie_idx on public.historique (anomalie_id, cree_le);

-- Première ligne d'historique à la création
create function public.historique_creation() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  insert into public.historique (anomalie_id, ancien, nouveau, commentaire, auteur)
  values (new.id, null, new.statut, 'Anomalie signalée', new.auteur);
  return new;
end $$;
create trigger anomalies_historique_creation after insert on public.anomalies
for each row execute function public.historique_creation();

-- Changement de statut contrôlé (transitions + historique daté)
create function public.changer_statut(
  p_anomalie uuid, p_nouveau public.statut, p_commentaire text, p_auteur text
) returns void
language plpgsql security invoker set search_path = '' as $$
declare v_ancien public.statut;
begin
  if coalesce(trim(p_auteur), '') = '' then
    raise exception 'Indiquez votre nom';
  end if;
  select statut into v_ancien from public.anomalies where id = p_anomalie for update;
  if not found then raise exception 'Anomalie introuvable'; end if;
  if not (
    (v_ancien = 'nouvelle' and p_nouveau = 'en_cours') or
    (v_ancien = 'en_cours' and p_nouveau = 'corrigee') or
    (v_ancien = 'corrigee' and p_nouveau in ('verifiee', 'en_cours')) or
    (v_ancien = 'verifiee' and p_nouveau = 'en_cours')
  ) then
    raise exception 'Transition interdite : % vers %', v_ancien, p_nouveau;
  end if;
  if v_ancien in ('corrigee', 'verifiee') and coalesce(trim(p_commentaire), '') = '' then
    raise exception 'Un commentaire est obligatoire pour vérifier ou rouvrir';
  end if;
  update public.anomalies set statut = p_nouveau, maj_le = now() where id = p_anomalie;
  insert into public.historique (anomalie_id, ancien, nouveau, commentaire, auteur)
  values (p_anomalie, v_ancien, p_nouveau, nullif(trim(p_commentaire), ''), trim(p_auteur));
end $$;

-- RLS partout
alter table public.anomalies enable row level security;
alter table public.captures enable row level security;
alter table public.historique enable row level security;

-- Droits V1 : lecture et création pour anon, statut modifiable seulement par colonne, aucune suppression
revoke all on public.anomalies, public.captures, public.historique from anon, authenticated;
grant select, insert on public.anomalies to anon, authenticated;
grant update (statut, maj_le) on public.anomalies to anon, authenticated;
grant select, insert on public.captures to anon, authenticated;
grant select, insert on public.historique to anon, authenticated;
revoke execute on function public.changer_statut(uuid, public.statut, text, text) from public;
grant execute on function public.changer_statut(uuid, public.statut, text, text) to anon, authenticated;
revoke execute on function public.historique_creation() from public, anon, authenticated;

create policy "v1 lecture anomalies" on public.anomalies for select to anon, authenticated using (true);
create policy "v1 creation anomalies" on public.anomalies for insert to anon, authenticated
  with check (statut = 'nouvelle');
create policy "v1 statut anomalies" on public.anomalies for update to anon, authenticated
  using (true) with check (true);
create policy "v1 lecture captures" on public.captures for select to anon, authenticated using (true);
create policy "v1 creation captures" on public.captures for insert to anon, authenticated
  with check (split_part(chemin, '/', 1) = anomalie_id::text);
create policy "v1 lecture historique" on public.historique for select to anon, authenticated using (true);
create policy "v1 historique" on public.historique for insert to anon, authenticated with check (true);
