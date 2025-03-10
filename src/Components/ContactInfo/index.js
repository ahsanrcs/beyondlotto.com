import React from "react";
import {
	Flex,
	SectionContainer,
	SectionContent,
	SectionHeader,
	SectionPreTitle,
} from "../../styles/global.syles";
import { ContactInfoContent, ContactInfoTitle } from "./ContactInfo.styles";
import contactinfo from "../../images/contact.png";
import { FaEnvelope, FaPhone } from "react-icons/fa";

const ContactInfo = () => {
	return (
		<SectionContainer bg='white'>
			<SectionContent>
				{/* --------------- */}
				{/* Section header  */}
				{/* --------------- */}
				<SectionHeader>
					{/* pre title  */}
					<SectionPreTitle>contact us</SectionPreTitle>
					{/* Title  */}
					<ContactInfoTitle>Call us or leave a Message</ContactInfoTitle>
				</SectionHeader>
				{/* --------------- */}
				{/* Section body  */}
				{/* --------------- */}
				<ContactInfoContent>
					<Flex justify='space-evenly' gap='20px' className='contact-info-flex'>
						{/* img part  */}
						<div className='img'>
							<img src={contactinfo} alt='Contact info' />
						</div>

						{/* contact part  */}
						<div className='contact_info'>
							<div className='info'>
								<div className='info-title'>send mail</div>
								<div className='info-des'>support@beyondlottotv.com</div>
							</div>
							<div className='info'>
								<div className='info-title'>georgia</div>
								<div className='info-des'>
									<Flex justify='flex-start' gap='20px'>
										<span>4047345448</span>
										<Flex gap='5px' justify='flex-start'>
											<span className='icon'>
												<FaEnvelope />
											</span>
											<span className='icon'>
												<FaPhone />
											</span>
										</Flex>
									</Flex>
								</div>
							</div>
							<div className='info'>
								<div className='info-title'>texas</div>
								<div className='info-des'>
									<Flex justify='flex-start' gap='20px'>
										<span>8323883526</span>
										<Flex gap='5px' justify='flex-start'>
											<span className='icon'>
												<FaEnvelope />
											</span>
											<span className='icon'>
												<FaPhone />
											</span>
										</Flex>
									</Flex>
								</div>
							</div>
						</div>
					</Flex>
				</ContactInfoContent>
			</SectionContent>
		</SectionContainer>
	);
};

export default ContactInfo;
