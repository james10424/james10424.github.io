// $(document).keypress(function(e) {
//     $("#root").append(e.key);
// });
// import React from 'react';
// import ReactDOM from 'react-dom';

class Term extends React.Component {
    constructor(props) {
        super(props);
        this.prompt = <span><a href="http://shittywebsite.ddns.net">shittyWebsite</a>$ </span>;
        this.state = {
            input: "",
            history: [],
            cursor: true,
            interval: -1,
            up: 1
        };
        this.process = s => {
            if (s == "") {
                return "";
            }
            s = s.split(" ");
            if (s[0] == "help") {
                if (!s[1]) {
                    return "Nothing really works here, it's just a fake terminal";
                }
                if (s[1] == "link") {
                    return (
                        <div>
                            <pre>LINK(1)    General Commands Manual     LINK(1)</pre>
                            <b>Name</b>
                            <pre>   link - generate a hyperlink</pre>
                            <b>SYNOPSIS</b>
                            <pre>   link <u>LINK</u></pre>
                            <b>DESCRIPTION</b>
                            <pre>   Return a hyperlink pointed to the address
                                    provided.
                            </pre>
                            <b>EXAMPLES</b>
                            <pre>   <b>link</b> <u>http://www.google.com</u></pre>
                            <pre>        <a href="http://www.google.com">http://www.google.com</a></pre>
                            <pre>   <b>link</b> <u>test/309</u></pre>
                            <pre>        <a href="test/309">test/309</a></pre>
                            <b>AUTHOR</b>
                            <pre>   Written by me</pre>
                            <b>REPORTING BUGS</b>
                            <pre>   Just don't tell me there are bugs</pre>
                        </div>
                    );
                }
                return "No help page for " + s[1];
            }
            if (s[0] == "link") {
                return <a href={s[1]}>{s[1]}</a>;
            }
            return s[0] + ": command not found"
        }
        this.keypress = e => {
            this.setState(prev => {
                this.clearInterval();
                this.setInterval();
                var ret = {};
                if (e.keyCode == 8) {
                    ret = {input: prev.input.substring(0, prev.input.length - 1)};
                }
                else if (e.keyCode == 13) {
                    var response = this.process(prev.input.trim());
                    var history = [...prev.history, [prev.input, response]];
                    if (history.length > 100) history = history.slice(0, 100);
                    ret = {input: "", history: history};
                }
                else {
                    ret = {input: prev.input + (e.ctrlKey ? "^" : "") + e.key};
                }
                ret.cursor = true;
                ret.up = 0;
                return ret;
            });
            this.scroll();
        }
        this.arrow = e => {
            this.setState(prev => {
                if (e.keyCode == 38) {
                    if (prev.up < prev.history.length) {
                        return {input: prev.history[prev.history.length - prev.up - 1][0], up: Math.min(prev.up + 1, Math.max(prev.history.length - 1, 0))};
                    }
                }
                if (e.keyCode == 40) {
                    var up = Math.max(prev.up - 1, 0);
                    if (up >= 0 && prev.history.length > 0) {
                        return {input: up >= 0 && prev.history.length > 0 ? prev.history[prev.history.length - up - 1][0] : prev.input, up: Math.max(up, 1)};
                    }
                }
                return {};
            });
        }
        this.setInterval = () => {
            this.setState({interval: setInterval(() => {
                this.setState(prev => {
                    return {cursor: !prev.cursor};
                });
            }, 1000)});
        }
        this.clearInterval = () => {
            clearInterval(this.state.interval);
            this.setState({interval: -1})
        }
        this.scroll = () => {
            var root = $("#outer")[0];
            root.scrollTop = root.scrollHeight;
        }
    }

    componentDidMount() {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            // mobile
            $("#input").keyup(this.keypress);
        }
        else {
            document.addEventListener("keypress", this.keypress);
            document.addEventListener("keydown", this.arrow);
        }
    }

    render() {
        return (
            <div>
                {this.state.history.map(k => <div>{this.prompt}{k[0]} <br/> {k[1]}</div>)}
                {this.prompt}{this.state.input}{this.state.cursor ? <span>|</span> : <span></span>}
            </div>
        );
    }
}

ReactDOM.render(<Term />, document.getElementById("root"));

document.addEventListener("touchend", function() {
    $("#input").focus();
}, true);

// $(document.body).ontouchend = function() {
//     $("#input").focus();
//     console.log("touich");
// };