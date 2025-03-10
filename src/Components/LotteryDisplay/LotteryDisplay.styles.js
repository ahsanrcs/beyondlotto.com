import styled from "styled-components";

export const LotterDisplayContent = styled.div`
	.img {
		width: fit-content;
		margin: auto;

		& > span {
			max-width: 100% !important;
		}

		img {
			max-width: 100% !important;
			object-fit: cover;
		}
	}
`;
