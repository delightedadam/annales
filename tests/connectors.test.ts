import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {parsePage} from '../scripts/connectors';
const fixture=(name:string)=>readFileSync(`tests/fixtures/${name}.html`,'utf8');
describe('formats réels rencontrés pendant la collecte complète',()=>{
 it('conserve les fiches dont le PDF n’est pas encore publié sans inventer un lien',()=>{
  const url='https://www.labolycee.org/exercices/etude-d-une-eruption-volcanique';
  const r=parsePage(fixture('labo-no-pdf'),url);
  expect(r.subjectUrl).toBe(url);expect(r.subjectFormat).toBe('source-page');
  expect(r.correctionUrl).toBeNull();expect(r.session).toBe('Session de remplacement');
  expect(r.notions.some(n=>n.label==='Deuxième loi de Newton')).toBe(true);
 });
 it('n’ajoute pas les thèmes des recommandations voisines',()=>{
  const html=fixture('labo-no-pdf')+'<article><a class="badge-thema">Effet Doppler</a></article>';
  const r=parsePage(html,'https://www.labolycee.org/exercices/etude-d-une-eruption-volcanique');
  expect(r.notions.some(n=>n.label==='Effet Doppler')).toBe(false);
 });
 it('parse les sujets complets Labolycée indépendamment des exercices',()=>{
  const r=parsePage(fixture('labo-complete'),'https://www.labolycee.org/sujets/2026-amerique-du-nord-bac-2026-amerique-du-nord-j1',{kind:'paper'});
  expect(r.kind).toBe('paper');expect(r.year).toBe(2026);expect(r.session).toBe('Jour 1');
  expect(r.subjectUrl).toContain('Sujet-Original');expect(r.correctionUrl).toBeNull();
 });
 it('extrait les liens séparés et les catégories Vecteur Bac',()=>{
  const r=parsePage(fixture('vecteur-exercise'),'https://www.vecteurbac.fr/la-lessive-de-cendre/',{kind:'exercise'});
  expect(r.year).toBe(2026);expect(r.exerciseNumber).toBe(3);expect(r.subjectFormat).toBe('pdf');
  expect(r.correctionUrl).toContain('Correction-La-lessive');expect(r.notions.map(n=>n.label)).toEqual(['Acide-base','Titrage']);
 });
 it('exclut une fiche de sciences de l’ingénieur même si le catalogue la classe mal',()=>{
  const html=fixture('labo-no-pdf').replace('Terminale Spécialité Physique Chimie',"Terminale Spécialité Sciences de l'ingénieur");
  expect(()=>parsePage(html,'https://www.labolycee.org/exercices/exemple')).toThrow('Hors périmètre');
 });
});
