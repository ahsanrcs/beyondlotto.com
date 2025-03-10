import React from "react";
import {
	SectionContainer,
	SectionContent,
	SectionHeader,
	SectionSubTitle,
	SectionTitle,
} from "../../styles/global.syles";
import { LotterDisplayContent } from "./LotteryDisplay.styles";
import tv from "../../images/tv.png";

const LotteryDisplay = () => {
	return (
		<SectionContainer bg='white'>
			<SectionContent>
				{/* --------------- */}
				{/* Section header  */}
				{/* --------------- */}
				<SectionHeader>
					{/* Title  */}
					<SectionTitle>Huge Lottery Display</SectionTitle>
					{/* Subtitle  */}
					<SectionSubTitle>
						4K High Resolution huge display for clear ticket image, selling
						amount & box display along with live updates for lotto prices.
					</SectionSubTitle>
				</SectionHeader>
				{/* --------------- */}
				{/* Section body  */}
				{/* --------------- */}
				<LotterDisplayContent>
					<div className='img'>
						<img src={tv} alt='Shopping' />
					</div>
				</LotterDisplayContent>
			</SectionContent>
		</SectionContainer>
	);
};

export default LotteryDisplay;
