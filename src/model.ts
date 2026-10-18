import { z } from 'zod';
export const normalize = (s:string) => s.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export function safeUrl(s:string) { try { const u=new URL(s); return u.protocol==='https:' && ['labolycee.org','www.labolycee.org','vecteurbac.fr','www.vecteurbac.fr'].includes(u.hostname) && !u.username && !u.password; } catch {return false;} }
const url=z.string().refine(safeUrl,'URL source non autorisée');
export const resourceSchema=z.object({
 id:z.string(),source:z.enum(['Labolycée','Vecteur Bac']),pageUrl:url,title:z.string().min(1),kind:z.enum(['exercise','paper']),examCode:z.string().nullable().default(null),
 level:z.enum(['Terminale','Première']),subject:z.literal('Physique-chimie'),year:z.number().int().min(1900).max(2100).nullable(),session:z.string().nullable(),center:z.string().nullable(),exerciseNumber:z.number().int().positive().nullable(),
 notions:z.array(z.object({label:z.string(),evidenceUrl:url,evidence:z.string().min(1)})),
 subjectUrl:url,subjectFormat:z.enum(['pdf','source-page']).default('pdf'),correctionUrl:url.nullable(),parentUrl:url.nullable(),childUrls:z.array(url),
 embed:z.object({allowed:z.boolean(),permissionUrl:url.nullable(),reason:z.string()}),
 indexedAt:z.string().datetime(),verifiedAt:z.string().datetime(),contentHash:z.string(),
 links:z.object({page:z.enum(['ok','missing','error']),subject:z.enum(['ok','missing','error','unchecked']),correction:z.enum(['ok','missing','error','unchecked','absent'])})
}).refine(r=>!r.embed.allowed || !!r.embed.permissionUrl,'Une preuve est requise pour intégrer un PDF');
export type Resource=z.infer<typeof resourceSchema>;
export const catalogueSchema=z.object({version:z.literal(1),generatedAt:z.string(),resources:z.array(resourceSchema)});
export type Catalogue=z.infer<typeof catalogueSchema>;
