import React from "react";
import {
	Flex,
	SectionContainer,
	SectionContent,
	SectionHeader,
	SectionSubTitle,
	SectionTitle,
} from "../../styles/global.syles";
import { LotteryAfter, LotteryBefore, LotteryContent } from "./Lottery.styles";
import leftimg from "../../images/lottery-before.png";
import rightimg from "../../images/lottery-after.png";

const Lottery = () => {
	return (
		<SectionContainer id='features' bg='#f1fbf2'>
			<SectionContent>
				{/* --------------- */}
				{/* Section header  */}
				{/* --------------- */}
				<SectionHeader>
					{/* Title  */}
					<SectionTitle fontSize='43px' color='#06240A'>
						Give your lottery a facelift
					</SectionTitle>
					{/* Subtitle  */}
					<SectionSubTitle color='#06240A'>
						Free your counter space.. see the before and after..
					</SectionSubTitle>
				</SectionHeader>
				{/* --------------- */}
				{/* Section body  */}
				{/* --------------- */}
				<LotteryContent>
					<Flex gap='40px' grow='1' className='lottery-content-flex'>
						<LotteryBefore>
							<div className='img'>
								<img src={leftimg} alt='Shopping' />
								<button>Before</button>
							</div>
						</LotteryBefore>
						<LotteryAfter>
							<div className='img'>
								<img src={rightimg} alt='Shopping' />
								<button>After</button>
							</div>
						</LotteryAfter>
					</Flex>
				</LotteryContent>
			</SectionContent>
		</SectionContainer>
	);
};

export default Lottery;
