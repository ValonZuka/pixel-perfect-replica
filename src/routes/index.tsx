import { createFileRoute } from '@tanstack/react-router';
import { Dashboard } from '@/components/enigma/Dashboard';
import { pageHead } from '@/lib/enigma/meta';
export const Route = createFileRoute('/')({ head: () => pageHead('Paneli im', 'Laboratorët, XP dhe blockchain-i yt personal. Mëso bazat e blockchain me Enigma.'), component: Dashboard });
