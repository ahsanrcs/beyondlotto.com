import React from "react";
import {
	Flex,
	SectionContainer,
	SectionContent,
} from "../../styles/global.syles";
import footerlogo from "../../images/logo-footer.png";
import { DividerAndCopy, FooterContent } from "./Footer.styles";

const Footer = () => {
	return (
		<SectionContainer bg='#f1fbf2' pb='0'>
			<FooterContent>
				<Flex justify='space-between' gap='20px' className='footer-flex'>
					{/* logo  */}
					<div className='logo'>
						<img src={footerlogo} alt='logo' />
					</div>
					{/* links  */}
					<Flex justify='flex-end' gap='30px' className='info-flex'>
						<div className='info'>
							<div className='info-title'>send mail</div>
							<div className='info-des'>support@beyondlottotv.com</div>
						</div>
						<div className='info'>
							<div className='info-title'>georgia</div>
							<div className='info-des'>4047345448</div>
						</div>
						<div className='info'>
							<div className='info-title'>texas</div>
							<div className='info-des'>8323883526</div>
						</div>
					</Flex>
				</Flex>
			</FooterContent>
			<DividerAndCopy>
				<div className='divider'></div>
				<div className='copyright'>2022 All Rights Reserved</div>
			</DividerAndCopy>
		</SectionContainer>
	);
};

export default Footer;
