import { createFileRoute } from '@tanstack/react-router';
import { Playground } from '@/components/enigma/Playground';
import { pageHead } from '@/lib/enigma/meta';
export const Route = createFileRoute('/playground')({ head:()=>pageHead('Playground','Eksperimente live me SHA-256, Proof of Work dhe pemën Merkle.'), component:Playground });
