
export class IntraUserImageDto {
	link: string;
}

export class IntraUserDto {
	id: number;
	login: string;
	image: IntraUserImageDto;
}