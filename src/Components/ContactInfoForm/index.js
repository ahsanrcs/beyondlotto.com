import React from "react";
import { useState } from "react";
import {
	Flex,
	Grid,
	SectionContainer,
	SectionContent,
	SectionHeader,
	SectionPreTitle,
} from "../../styles/global.syles";
import { showError, showSuccess } from "../../utils/functions";
import { ContactInfoTitle } from "../ContactInfo/ContactInfo.styles";
import Input from "../Input";
import { ContactInfoFormContent } from "./ContactInfoForm.styles";

const ContactInfoForm = () => {
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		const data = {
			name: e.target.name.value,
			email: e.target.email.value,
			subject: e.target.subject.value,
			message: e.target.message.value,
		};
		for (const [key, value] of Object.entries(data)) {
			if (!value) {
				showError("Please fill out all the fields");
				setLoading(false);
				return;
			}
		}
		fetch(process.env.REACT_APP_SERVER_URL + "/sendMessage", {
			method: "POST",
			body: JSON.stringify(data),
		})
			.then((r) => r.json())
			.then((res) => {
				if (res.result) {
					showSuccess("We have received your message");
					document.getElementById("contact_form").reset();
				} else {
					showError("Something went wrong");
				}
			})
			.catch((e) => {
				showError("Something went wrong");
				console.log(e);
			})
			.finally(() => {
				setLoading(false);
			});
	};
	return (
		<SectionContainer id='contact-us' bg='white'>
			<SectionContent>
				{/* --------------- */}
				{/* Section header  */}
				{/* --------------- */}
				<SectionHeader>
					{/* pre title  */}
					<SectionPreTitle>contact us</SectionPreTitle>
					{/* Title  */}
					<ContactInfoTitle>Send Us a Message</ContactInfoTitle>
				</SectionHeader>
				{/* --------------- */}
				{/* Section body  */}
				{/* --------------- */}
				<ContactInfoFormContent>
					<form onSubmit={handleSubmit} id='contact_form'>
						<Flex direction='column' gap='30px'>
							<Grid columns='repeat(2, 1fr)' gap='30px' className='input-row'>
								<Input type='text' name='name' id='name' placeholder='Name' />
								<Input
									type='email'
									name='email'
									id='email'
									placeholder='Email'
								/>
							</Grid>
							<Grid columns='repeat(1, 1fr)' gap='30px'>
								<Input
									type='text'
									name='subject'
									id='subject'
									placeholder='Subject'
								/>
							</Grid>
							<Grid columns='repeat(1, 1fr)' gap='30px'>
								<textarea
									name='message'
									id='message'
									placeholder='Message'
								></textarea>
							</Grid>
							<Grid columns='repeat(1, 1fr)' gap='30px'>
								<button type='submit'>
									{loading && (
										<div
											className='spinner-border spinner-border-sm text-white mr-2 text-xs'
											role='status'
										></div>
									)}
									Send Message
								</button>
							</Grid>
						</Flex>
					</form>
				</ContactInfoFormContent>
			</SectionContent>
		</SectionContainer>
	);
};

export default ContactInfoForm;
