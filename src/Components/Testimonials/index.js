import React from "react";
import {
	SectionContainer,
	SectionContent,
	SectionHeader,
	SectionSubTitle,
	SectionTitle,
} from "../../styles/global.syles";
import { LotterDisplayContent } from "./index.styles";
import tv from "../../images/tv.png";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
// import * as imageArray from "../../assets/images/testimonials";

const Testimonials = () => {
	return (
		<SectionContainer bg='white'>
			<SectionContent>
				{/* --------------- */}
				{/* Section header  */}
				{/* --------------- */}
				<SectionHeader>
					{/* Title  */}
					<SectionTitle>Testimonials</SectionTitle>
				</SectionHeader>
				{/* --------------- */}
				{/* Section body  */}
				{/* --------------- */}
				<LotterDisplayContent>
					<Carousel
						showArrows
						showThumbs={false}
						infiniteLoop
						autoPlay
						showStatus={false}
						className='carousel_radius'
					>
						{[...Array(12).keys()].map((n) => (
							<div style={{ borderRadius: "20px", overflow: "hidden" }}>
								<img
									style={{
										objectFit: "cover",
										borderRadius: "20px",
										overflow: "hidden",
										height: "80vw",
										maxHeight: "500px",
										minHeight: "300px",
									}}
									width={200}
									src={require(`../../assets/images/testimonials/${
										n + 1
									}.jpeg`)}
									alt={n}
								/>
							</div>
						))}
					</Carousel>
				</LotterDisplayContent>
			</SectionContent>
		</SectionContainer>
	);
};

export default Testimonials;
