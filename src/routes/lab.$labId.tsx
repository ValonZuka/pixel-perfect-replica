import { createFileRoute } from '@tanstack/react-router';
import { LabPage } from '@/components/enigma/LabPage';
import { pageHead } from '@/lib/enigma/meta';
import { labs } from '@/lib/enigma/labs';
export const Route = createFileRoute('/lab/$labId')({ head:({params})=>{const lab=labs.find(l=>l.id===params.labId);return pageHead(lab?.t??'Laboratori',lab?.g??'Ushtrime praktike për blockchain.')}, component:LabRoute });
function LabRoute(){const {labId}=Route.useParams();return <LabPage labId={labId}/>}
