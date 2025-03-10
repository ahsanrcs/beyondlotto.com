import styled from "styled-components";
import { Flex, SectionTitle } from "../../styles/global.syles";

export const ContactInfoFormContent = styled.div`
	width: 80%;
	margin: auto;
	padding-top: 60px;

	@media screen and (max-width: 991px) {
		width: 100%;

		.contact-info-flex {
			justify-content: space-between;
		}
	}

	@media screen and (max-width: 640px) {
		.contact-info-flex {
			flex-direction: column;
		}
	}

	textarea {
		width: 100%;
		font-size: 12px;
		padding: 17px 15px;
		border-radius: 5px;
		border: 2px solid #e8ede9;
		outline: none;
		resize: none;
		min-height: 100px;

		&:focus,
		&:hover {
			border-color: var(--light-green-color);
		}
	}

	button {
		color: white;
		font-size: 14px;
		padding: 13px 20px;
		width: 170px;
		text-align: center;
		border: 0;
		border-radius: 355px;
		font-family: var(--font-lato);
		font-weight: 600;
		background: linear-gradient(to right, #2ca63a 0%, #3add52 100%);
		margin: auto;
		margin-top: 30px;
		cursor: pointer;
		transition: all 0.3s;

		&:hover {
			opacity: 0.8;
		}
	}

	.input-row {
		@media screen and (max-width: 640px) {
			grid-template-columns: 1fr;
		}
	}
`;
