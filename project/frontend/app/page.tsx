import Wrap from '@/components/wrap';
import LinkButton from '@/components/link-button';

export default function Home() {
	return (
		<Wrap withGoBack={false}>
			<h1 className='text-4xl font-bold'>Izaberite sistem koji želite</h1>
			<div className='flex flex-col gap-y-4 mt-8'>
				<LinkButton href={'/fakultet'}>Fakultet</LinkButton>
				<LinkButton href={'/sluzba-za-zaposljavanje'}>
					Sistem za zapošljavanje
				</LinkButton>
			</div>
		</Wrap>
	);
}
