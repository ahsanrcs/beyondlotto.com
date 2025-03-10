import React from "react";
import {
	Grid,
	SectionContainer,
	SectionContent,
	SectionHeader,
	SectionPreTitle,
	SectionTitle,
} from "../../styles/global.syles";
import PlansCard from "../PlansCard";
import { PlansContent } from "./Plans.styles";

const Plans = () => {
	return (
		<SectionContainer bg='#f1fbf2'>
			<SectionContent>
				{/* --------------- */}
				{/* Section header  */}
				{/* --------------- */}
				<SectionHeader>
					{/* pre title  */}
					<SectionPreTitle>Subscription</SectionPreTitle>
					{/* Title  */}
					<SectionTitle>Subscription Plans</SectionTitle>
				</SectionHeader>
				{/* --------------- */}
				{/* Section body  */}
				{/* --------------- */}
				<PlansContent>
					<Grid gap='30px' columns='repeat(4, 1fr)'>
						<PlansCard plan='Plan A' price='25' screen='1' />
						<PlansCard plan='Plan B' price='40' screen='2' />
						<PlansCard plan='Plan C' price='50' screen='3' />
						<PlansCard plan='Plan D' price='60' screen='4' />
					</Grid>
				</PlansContent>
			</SectionContent>
		</SectionContainer>
	);
};

export default Plans;
