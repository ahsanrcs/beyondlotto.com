import styled from "styled-components";
import { Grid } from "../../styles/global.syles";

export const PlansContent = styled.div`
	@media screen and (max-width: 767px) {
		${Grid} {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media screen and (max-width: 480px) {
		${Grid} {
			grid-template-columns: repeat(1, 1fr);
		}
	}
`;
