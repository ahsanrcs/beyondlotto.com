import styled from "styled-components";
import { Flex, SectionTitle } from "../../styles/global.syles";

export const ContactInfoTitle = styled(SectionTitle)`
	width: fit-content;
	margin: auto;
	position: relative;
	z-index: 1;

	&::after {
		content: "";
		position: absolute;
		left: 50%;
		top: 80%;
		transform: translate(-50%, -50%);
		width: 65%;
		height: 60%;
		background-color: var(--light-green-color);
		opacity: 0.1;
		border-radius: 10px;
	}
`;

export const ContactInfoContent = styled.div`
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

	.info {
		margin-bottom: 36px;
	}

	.info-title {
		color: var(--light-green-color);
		text-transform: uppercase;
		margin-bottom: 10px;
		font-weight: 500;
	}

	.info-des {
		font-size: 20px;
	}

	.icon {
		background: #ecf0ec;
		color: var(--light-green-color);
		display: inline-block;
		height: 45px;
		width: 45px;
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 16px;
	}
`;
