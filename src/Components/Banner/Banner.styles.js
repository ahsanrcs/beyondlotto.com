import styled from "styled-components";

export const Container = styled.div`
	min-height: calc(100vh + 200px);
`;

export const UpperContainer = styled.div`
	min-height: calc(100vh + 200px);
	position: relative;
`;

export const BannerContent = styled.div`
	position: absolute;
	top: 50%;
	transform: translateY(-50%);
	left: 80px;
	width: 540px;
	max-width: 90%;

	@media screen and (max-width: 640px) {
		left: 40px;
	}

	h1 {
		font-size: 60px;
		font-weight: 700;

		@media screen and (max-width: 640px) {
			font-size: 40px;
		}
	}
`;
