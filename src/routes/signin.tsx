import { createFileRoute } from '@tanstack/react-router';
import { SignIn } from '@/components/enigma/SignIn';
import { pageHead } from '@/lib/enigma/meta';
export const Route = createFileRoute('/signin')({head:()=>pageHead('Profili yt','Krijo profilin lokal, zgjidh partnerin dhe nis aventurën blockchain.'),component:SignIn});
