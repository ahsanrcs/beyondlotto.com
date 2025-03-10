import React from "react";
import { BannerContent, Container, UpperContainer } from "./Banner.styles";
import Navbar from "../LandingNav";

const Banner = () => {
	return (
		<Container className='banner-container'>
			<UpperContainer className='upper-banner-container'>
				<Navbar />
				<BannerContent>
					<h1>Free your counter space, increase lottery sales</h1>
				</BannerContent>
			</UpperContainer>
		</Container>
	);
};

export default Banner;
