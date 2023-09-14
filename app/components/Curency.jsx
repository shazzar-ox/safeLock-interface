

const Curency = ({ icon, contract, name, digit }) => {
	return (
		<>
			<div class="flex items-center gap-x-4 border-double w-1/2">
				<div>{icon}</div>
				<div>
					<i>click to save more {name}</i>
					<h2>TokenKeep {name}</h2>
				</div>
				<div>
					Total {name} saved: <button class="rounded-full">3</button>
				</div>
			</div>
		</>
	);
};
export default Curency;
