import styled from "styled-components";
import { Flex } from "../../styles/global.syles";

export const LotteryContent = styled.div`
	${Flex} {
		@media screen and (max-width: 640px) {
			flex-direction: column;
		}
	}
`;

export const LotteryBefore = styled.div`
	flex: 1;

	.img {
		position: relative;

		& > span {
			width: 100% !important;
		}

		img {
			max-width: 100%;
			object-fit: cover;
			width: 100% !important;
		}

		button {
			position: absolute;
			left: 50%;
			bottom: -20px;
			transform: translateX(-50%);
			background: #343434;
			color: white;
			font-size: 20px;
			padding: 15px 20px;
			width: 200px;
			text-align: center;
			border: 0;
			border-radius: 15px;
			font-family: "Josefin Sans", sans-serif;

			@media screen and (max-width: 767px) {
				width: 150px;
			}
		}
	}
`;

export const LotteryAfter = styled(LotteryBefore)`
	.img {
		button {
			background: linear-gradient(to bottom right, #2da83b 0%, #3add52 100%);
		}
	}
`;
