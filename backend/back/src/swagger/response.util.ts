import { ApiProperty } from '@nestjs/swagger';

export class ResponseErrorDto {
	@ApiProperty({
		description: 'HTTP status code',
		type: 'number',
	})
	statusCode: number;

	@ApiProperty({
		description: 'Error message',
		type: 'string',
	})
	message: string;

	@ApiProperty({
		description: 'Error name',
		type: 'string',
		required: false,
	})
	error?: string;
}

export enum DescriptionSwagger {
	NL = "<br>",
	NL2 = "<br><br>",
	Test = "<H4>[ TEST ]</H4>",
	Api = "<i> API test</i><br>",
	Swagger = "<i> Swagger test</i><br>",
}

export function makeListContent(str: string[]): string {
	let result = "<ol>";
	for (const line of str) {
		result += "<li>" + line + "</li>";
	}
	result += "</ol>";
	return result;
}

export function makeUnorderedListContent(str: string[]): string {
	let result = "<ul>";
	for (const line of str) {
		result += "<li>" + line + "</li>";
	}
	result += "</ul>";
	return result;
}

export function callFunctionDescriptionOfRefreshRoute(str: string): string {
	return '\"Bearer refreshToken\"' + DescriptionSwagger.NL2 + DescriptionSwagger.Test +
		DescriptionSwagger.Api + makeListContent([
			"header에 authorization을 추가",
			"추가한 헤더의 값은 \"Bearer [refreshToken]\"으로 입력",
		]) + DescriptionSwagger.NL2 +
		DescriptionSwagger.Swagger + makeUnorderedListContent([
			"Swagger에서는 Accept, Content-Type, Authorization 헤더를 파라미터로 테스트 할 수 없음 => " +
			"<a href=\"https://swagger.io/docs/specification/describing-parameters/#header-parameters\"> 참고 </a>",
			"따라서 하단의 테스트 박스에 알맞은 Bearer Token을 입력해도 작동하지 않는다.",
		]) + makeListContent([
			"우측 상단의 자물쇠를 누르고, refreshToken의 값을 입력한다. \"Bearer \"는 입력하지 않는다.",
			"하단의 테스트 박스에는 임의의 값을 입력한다. (비어 있을시 테스트 불가)",
			"Execute를 누른다."
		]);
}
