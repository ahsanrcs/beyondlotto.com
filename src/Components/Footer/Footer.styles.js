import styled from "styled-components";
import { SectionContent } from "../../styles/global.syles";

export const FooterContent = styled(SectionContent)`
	.footer-flex {
		@media screen and (max-width: 767px) {
			flex-direction: column;
			justify-content: flex-start;
			align-items: flex-start;
		}
	}

	.info-flex {
		@media screen and (max-width: 767px) {
			justify-content: flex-start;
			align-items: flex-start;
		}

		@media screen and (max-width: 480px) {
			flex-direction: column;
		}
	}

	.info-title {
		color: var(--light-green-color);
		text-transform: uppercase;
		margin-bottom: 10px;
		font-weight: 500;
		font-size: 14px;
	}

	.info-des {
		font-size: 16px;
		font-weight: 400;
	}
`;

export const DividerAndCopy = styled.div`
	.divider {
		width: 100%;
		height: 1px;
		margin-top: 40px;
		background-color: #d8f3db;
	}

	.copyright {
		color: var(--dark-green-color);
		font-size: 13px;
		margin: auto;
		text-align: center;
		padding: 20px;
	}
`;
