import styled from "styled-components";
import { Flex } from "../../styles/global.syles";

export const NavbarContainer = styled.nav`
	background: ${(props) =>
		!props.isFixed
			? "linear-gradient(to bottom, #ffffff 0%, #ffffff00 100%)"
			: "white"};
	position: ${(props) => (props.isFixed ? "fixed" : "static")};
	top: ${(props) => props.isFixed && (props.shouldShow ? "0" : "-200px")};
	z-index: 9999;
	transition: all 0.3s;
	width: 100%;
	box-shadow: ${(props) =>
		props.shouldShow && "rgba(0, 0, 0, 0.45) 0px 5px 20px -20px"};

	.logo {
		cursor: pointer;
	}

	.container {
		position: relative;
		padding: ${(props) => (props.shouldShow ? "25px" : "40px")} 85px;

		@media screen and (max-width: 500px) {
			padding: ${(props) => (props.shouldShow ? "25px" : "40px")} 40px;
		}
	}

	a {
		font-size: 20px;
		text-decoration: none;
		color: #06240a;
		transition: all 0.2s;

		&.active {
			font-weight: 700;
		}

		&:hover {
			color: var(--dark-green-color);
		}
	}

	button {
		color: white;
		font-size: 14px;
		padding: 13px 30px;
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

	.bars {
		font-size: 22px;
		cursor: pointer;
		padding: 1px 3px;
		display: none;

		@media screen and (max-width: 767px) {
			display: block;
		}
	}

	.links {
		${Flex} {
			@media screen and (max-width: 767px) {
				/* display: none; */
				flex-direction: column;
				position: absolute;
				left: 0;
				top: ${(props) => (props.shownav ? "100%" : "-300%")};
				gap: 20px;
				width: 100%;
				background-color: white;
				padding: 20px 0;
				transition: all 0.3s;
				z-index: 99;
			}
		}
	}

	img {
		@media screen and (max-width: 640px) {
			width: 100px !important;
		}
	}
`;
