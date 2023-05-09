import Head from "next/head";
//export const config = {  runtime: "edge",};


export default function MyApp({ Component, pageProps }) {
	return (
		<>
			<Head>
				<title>Олимпиды по программированию РС(Я)</title>
				<link rel="icon" href="/favicon16.png" />
			</Head>
			<Component {...pageProps} />
		</>
	);
}
