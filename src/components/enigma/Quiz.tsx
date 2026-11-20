import { useLab, type Question } from '@/lib/enigma/store';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Check, X } from 'lucide-react';
export function Quiz({ labId }: { labId: string }) {
 const {data,profile,updateProfile}=useLab();
 const defaults:Question[]=[{id:'hash',lab:labId,text:'Sa karaktere hex ka një hash SHA-256?',options:['32 karaktere','64 karaktere','256 karaktere'],answer:1},{id:'merkle',lab:labId,text:'Çfarë ndodh me Merkle root kur ndryshon një transaksion?',options:['Mbetet i njëjtë','Ndryshon vetëm një shkronjë','Ndryshon i gjithë root-i'],answer:2},{id:'wallet',lab:labId,text:'Me kë mund ta ndash seed phrase?',options:['Me asnjë','Me ligjëruesin','Me një koleg të besuar'],answer:0}];
 const questions=[...defaults,...data.questions.filter(q=>q.lab===labId)];const answers=profile.quizzes[labId]??[];
 function answer(i:number,value:number){updateProfile(p=>{if(p.quizzes[labId]?.[i]!==undefined)return p;const a=[...(p.quizzes[labId]??[])];a[i]=value;return{...p,quizzes:{...p.quizzes,[labId]:a},xp:p.xp+(questions[i].answer===value?1:0)}})}
 return <section className="tool-card"><h2><BrainCircuit/>Kuizi i seancës</h2><span className="eyebrow">{questions.length} PYETJE · +1 XP PËR PËRGJIGJE TË SAKTË</span>{questions.map((q,i)=><div className="quiz-question" key={q.id}><h3>{i+1}. {q.text}</h3>{q.options.map((o,j)=><Button key={o} variant="outline" className={`quiz-option ${answers[i]!==undefined&&j===q.answer?'correct':answers[i]===j?'incorrect':''}`} disabled={answers[i]!==undefined} onClick={()=>answer(i,j)}><span>{String.fromCharCode(65+j)}.</span>{o}{answers[i]===j&&(j===q.answer?<Check/>:<X/>)}</Button>)}{answers[i]!==undefined&&<p className="feedback">{answers[i]===q.answer?'Saktë! +1 XP':'Përgjigjja e saktë: '+q.options[q.answer]}</p>}</div>)}</section>;
}
