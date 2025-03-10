import React from "react";
import { Flex } from "../../styles/global.syles";
import { Container } from "./PlansCard.styles";
import crown from "../../images/crown.png";

const PlansCard = ({ plan, price, screen }) => {
	return (
		<Container>
			<div className='card_header'>
				<Flex direction='column' gap='10px'>
					<img src={crown} alt='Crown icon' />
					<p>{plan}</p>
				</Flex>
			</div>
			<div className='card_body'>
				<div className='price'>${price}</div>
				<div className='screen'>{screen} screen</div>
				<div className='subs-btn'>Subscribe</div>
			</div>
		</Container>
	);
};

export default PlansCard;
