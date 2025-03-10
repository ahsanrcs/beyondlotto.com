import { Helmet } from "react-helmet";
import React from "react";
import Banner from "../Components/Banner";
import Lottery from "../Components/Lottery";
import LotteryDisplay from "../Components/LotteryDisplay";
import Plans from "../Components/Plans";
import ContactInfo from "../Components/ContactInfo";
import ContactInfoForm from "../Components/ContactInfoForm";
import Footer from "../Components/Footer";
import AppDownload from "../Components/AppDownload";
import "../styles/main.css";
import Testimonials from "../Components/Testimonials";

export default function Landing() {
	return (
		<div style={{ background: "white", color: "black" }}>
			<Helmet>
				<title>Beyond Lotto</title>
				<meta name='description' content='Beyond Lotto app' />
				<link rel='icon' href='/favicon.ico' />
			</Helmet>

			<main>
				<Banner />
				<Lottery />
				<LotteryDisplay />
				<Plans />
				<Testimonials />
				<ContactInfo />
				<ContactInfoForm />
				<AppDownload />
				<Footer />
			</main>
		</div>
	);
}
