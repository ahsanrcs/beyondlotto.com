import styled from "styled-components";
import { Flex } from "../../styles/global.syles";

export const Container = styled.div`
	flex: 1;
	box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 15px -3px,
		rgba(0, 0, 0, 0.05) 0px 4px 6px -2px;
	border-radius: 2px;

	.card_header {
		background-color: #e0f6e3;
		padding: 17px;
		font-family: var(--lato-font);
	}

	.card_body {
		padding: 25px 40px;
		background: white;

		.price {
			font-size: 60px;
			font-family: var(--poppins-font);
			text-align: center;
			color: var(--dark-green-color);
		}

		.screen {
			text-align: center;
			color: var(--dark-green-color);
			font-family: var(--poppins-font);
			font-weight: 500;
			font-size: 11px;
			background: #f2f5f3;
			width: fit-content;
			margin: auto;
			padding: 2px 10px;
			border-radius: 20px;
			margin-bottom: 40px;
		}

		.subs-btn {
			color: white;
			font-size: 14px;
			padding: 13px 20px;
			width: 100%;
			text-align: center;
			border: 0;
			border-radius: 355px;
			font-family: var(--font-lato);
			font-weight: 600;
			background: linear-gradient(to right, #2ca63a 0%, #3add52 100%);
			margin: auto;
			cursor: pointer;
			transition: all 0.3s;

			&:hover {
				opacity: 0.8;
			}
		}
	}
`;
