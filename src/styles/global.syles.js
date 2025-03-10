import styled, { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  /* importing fonts 'Josefin Sans' as primary, 'Lato', 'Montserrate', 'Poppins'  */

  :root {
    --light-green-color: #33C145;
    --dark-green-color: #0D3E13;
    --josefin-font: 'Josefin Sans', sans-serif;
    --lato-font: 'Lato', sans-serif;
    --montserrate-font: 'Montserrat', sans-serif;
    --poppins-font: 'Poppins', sans-serif;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    padding: 0;
    min-height: 100vh;
    font-family: 'Josefin Sans', sans-serif;
  }
`;

// -----------------------
// Utility Component
// -----------------------
export const Flex = styled.div`
	width: 100%;
	display: flex;
	justify-content: ${(props) => props.justify || "center"};
	align-items: center;
	gap: ${(props) => props.gap || " 20px"};
	flex-direction: ${(props) => props.direction || "row"};
`;

export const Grid = styled.div`
	width: 100%;
	display: grid;
	justify-content: center;
	align-items: center;
	gap: ${(props) => props.gap || " 20px"};
	grid-template-columns: ${(props) => props.columns || "repeat(3, 1fr)"};
`;

// -----------------------
// Global custom component
// -----------------------
export const SectionContainer = styled.section`
	background-color: ${(props) => props.bg || "white"};
	padding: 70px 0;
	padding-bottom: ${(props) => props.pb || "70px"};
`;

export const SectionContent = styled.div`
	width: 70%;
	margin: auto;

	@media screen and (max-width: 500px) {
		width: 90%;
	}
`;

export const SectionHeader = styled.div`
	text-align: center;
	padding-bottom: 50px;
`;

export const SectionTitle = styled.h1`
	color: ${(props) => props.color || "var(--dark-green-color)"};
	font-size: ${(props) => props.fontSize || "28px"};
`;

export const SectionSubTitle = styled.p`
	font-size: 18px;
	font-weight: 300;
	color: ${(props) => props.color || "var(--dark-green-color)"};
	margin-top: 10px;
`;

export const SectionPreTitle = styled.p`
	font-family: var(--montserrate-font);
	font-size: 12px;
	color: var(--light-green-color);
	text-transform: uppercase;
	font-weight: 500;
	position: relative;
	width: fit-content;
	margin: auto;
	margin-bottom: 10px;
	z-index: 1;

	&::after {
		content: "";
		position: absolute;
		left: 10%;
		top: 80%;
		transform: translateY(-50%);
		width: 100%;
		height: 60%;
		background-color: var(--light-green-color);
		opacity: 0.1;
		border-radius: 10px;
	}
`;
