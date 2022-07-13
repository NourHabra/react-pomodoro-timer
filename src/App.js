import React from "react";
import "./App.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const initState = {
	session: 25,
	break: 5,
	difference: 1500000,
	playing: false,
	mode: "Session",
	interval: null,
	started: false,
};

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = initState;
		this.reset = this.reset.bind(this);
		this.changeSession = this.changeSession.bind(this);
		this.changeBreak = this.changeBreak.bind(this);
		this.beginTimer = this.beginTimer.bind(this);
		this.handleEvents = this.handleEvents.bind(this);
		this.alert = this.alert.bind(this);
		this.notify = this.notify.bind(this);
	}

	changeSession(e) {
		console.log(e);
		let change = Number(e.currentTarget.value); //Not .target because that selects the img
		if (this.state.session == 60 && change == 1) return;
		if (this.state.session == 1 && change == -1) return;
		const currTime = new Date().getTime();
		const endTime = currTime + (this.state.session + change) * 60000;
		const difference = endTime - currTime;
		this.setState({
			session: this.state.session + change,
			difference: this.state.started ? this.state.difference : difference,
		});
		this.notify(change == 1 ? "Session increased" : "Session decreased");
	}

	changeBreak(e) {
		let change = Number(e.currentTarget.value);
		if (this.state.break == 60 && change == 1) return;
		if (this.state.break == 1 && change == -1) return;
		this.setState({
			break: this.state.break + change,
		});
		this.notify(change == 1 ? "Break increased" : "Break decreased");
	}

	reset() {
		clearInterval(this.state.interval);
		this.setState(initState);
		document.getElementById("beep").pause();
		document.getElementById("beep").currentTime = 0;
		this.notify("Timer reset");
	}

	format(ms) {
		let m = Math.floor(ms / 60000);
		let s = ((ms % 60000) / 1000).toFixed(0);
		let timeFormated =
			(m < 10 ? "0" : "") +
			(m < 0 ? "0" : m) +
			":" +
			(s < 10 ? "0" : "") +
			(s < 0 ? "0" : s);
		return timeFormated;
	}

	beginTimer() {
		if (!this.state.playing) {
			this.setState({
				difference: this.state.difference - 1000,
				started: true,
			});
			this.setState({
				interval: setInterval(() => {
					this.setState({ difference: this.state.difference - 1000 });
					this.handleEvents();
				}, 1000),
				playing: true,
			});
			this.notify("Timer started");
			return;
		} else {
			clearInterval(this.state.interval);
			this.setState({
				playing: false,
				interval: null,
			});
			this.notify("Timer paused");
		}
	}

	handleEvents() {
		if (this.state.difference <= 0) {
			const currTime = new Date().getTime();
			const endTime =
				this.state.mode == "Session"
					? currTime + this.state.break * 60000
					: currTime + this.state.session * 60000;
			const difference = endTime - currTime;
			this.setState((state) => ({
				difference: difference,
				mode: state.mode == "Session" ? "Break" : "Session",
			}));
			this.notify("Switched mode");
			this.alert();
		}
	}

	alert() {
		if (this.state.difference == 0) {
			document.getElementById("beep").play();
			this.notify("00:00 Reached");
		}
	}

	notify(text) {
		console.log(text);
		toast(text, {
			position: "top-right",
			autoClose: 2500,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			progress: undefined,
		});
	}

	render() {
		return (
			<div className="App">
				<ToastContainer
					position="top-right"
					autoClose={5000}
					hideProgressBar={false}
					newestOnTop
					closeOnClick
					rtl={false}
					pauseOnFocusLoss
					draggable
					pauseOnHover
					theme="dark"
				/>
				<h1>Pomodoro Timer</h1>
				<div id="timer">
					<div className="control" id="session-control">
						<h2 className="label" id="session-label">
							Session Duration
						</h2>
						<div className="control-buttons">
							<button
								id="session-decrement"
								onClick={this.changeSession}
								value={-1}
							>
								<img
									className="arrow down"
									src="./up-arrow.png"
									alt="arrow"
								></img>
							</button>
							<h2 id="session-length">{this.state.session}</h2>
							<button
								id="session-increment"
								onClick={this.changeSession}
								value={1}
							>
								<img
									className="arrow up"
									src="./up-arrow.png"
									alt="arrow"
								></img>
							</button>
						</div>
					</div>
					<div className="control" id="break-control">
						<h2 className="label" id="break-label">
							Break Duration
						</h2>
						<div className="control-buttons">
							<button
								id="break-decrement"
								onClick={this.changeBreak}
								value={-1}
							>
								<img
									className="arrow down"
									src="./up-arrow.png"
									alt="arrow"
								></img>
							</button>
							<h2 id="break-length">{this.state.break}</h2>
							<button
								id="break-increment"
								onClick={this.changeBreak}
								value={1}
							>
								<img
									className="arrow up"
									src="./up-arrow.png"
									alt="arrow"
								></img>
							</button>
						</div>
					</div>
					<div id="display">
						<h2 id="timer-label">{this.state.mode}</h2>
						<h2 id="time-left">
							{!this.state.started && this.state.session + ":00"}
							{this.state.started &&
								this.format(this.state.difference)}
						</h2>
						<button id="start_stop" onClick={this.beginTimer}>
							<img
								src={
									this.state.playing
										? "pause.svg"
										: "play.svg"
								}
								alt={this.state.playing ? "pause" : "play"}
								className="icon"
							></img>
						</button>
						<button id="reset" onClick={this.reset}>
							<img
								src="reset.svg"
								alt={this.state.playing ? "pause" : "play"}
								className="icon"
							></img>
						</button>
						<audio src="beep.mp3" id="beep"></audio>
					</div>
				</div>
				<p>
					developed by{" "}
					<a href="https://github.com/NourHabra" target={"_blank"}>
						NourHabra
					</a>
				</p>
			</div>
		);
	}
}

export default App;
