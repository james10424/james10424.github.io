const levels = [
    [5, [[0, 0], [1, 0],[2,2],[4,2],[0,4],[4,4]],[[0, 1]]],
    [5, [[0, 0], [1, 0],[2,2],[4,2],[0,4],[4,4]],[[0, 2]]],
    [5, [[0, 0], [1, 0],[2,2],[4,2],[0,4],[4,4]],[[0, 3]]],
    [5, [[0, 0], [1, 0],[2,2],[4,2],[0,4],[4,4]],[[1, 1]]],
    [5, [[0, 0], [1, 0],[2,2],[4,2],[0,4],[4,4]],[[1, 2]]],
    [5, [[0, 0], [1, 0],[2,2],[4,2],[0,4],[4,4]],[[1, 3]]],
    [5, [[0, 0], [1, 0],[2,2],[4,2],[0,4],[4,4]],[[1, 4]]],
    [5, [[0, 0], [1, 0],[2,2],[4,2],[0,4],[4,4]],[[2, 0]]],
    [5, [[0, 0], [1, 0],[2,2],[4,2],[0,4],[4,4]],[[2, 1]]],
    [5, [[0, 0], [0, 2],[0,4],[2,0],[4,0]],[[4, 4]]],
    [5, [[0, 0], [1, 0],[2,2],[4,2],[0,4],[4,4]],[[4, 0]]],
    [5, [[0, 0], [1, 0],[2,2],[4,2],[0,4],[4,4]],[[4, 1]]],
    [5, [[0, 0], [1, 0],[2,2],[4,2],[0,4],[4,4]],[[4, 3]]],
    [7, [[4, 2], [1, 3], [6,3], [5,4]], [[6, 2]]],
    [7, [[2, 1], [4, 2], [2,6]], [[4, 6]]],
    [7, [[2, 1], [3, 1], [4, 1], [2,6], [4,6]], [[2, 0],[3, 0],[4, 0]]],
    [7, [[1, 2], [0 ,2], [2 ,3], [4, 4], [2, 5]], [[2, 4],[3, 1],[4, 0]]],
    [7, [[3, 2], [0 ,2], [3 ,3], [4, 4], [2, 5]], [[1, 2],[3, 0],[4, 0]]],
    [7, [[3, 1], [0 ,2], [3 ,3], [4, 4], [2, 5]], [[1, 2],[3, 0],[4, 0]]],
    [7, [[2, 1], [0 ,2], [1 ,2], [6, 4], [2, 5]], [[2, 0],[3, 0],[4, 0]]],
    [9, [[2,2], [3,4], [4,5], [5,5], [5,0], [6,1], [6,4], [7,0], [8,1], [8,3]], [[0,0], [0,8]]],
]
class Btn extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <button onClick={this.props.onclick} disabled={this.props.disabled || this.props.disabled != undefined}>{this.props.text}</button>
        );
    }
}
class Lockout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dimension: props.dimension,
            xanadus: props.xanadus.map(function(k){
                return {x: k[0], y: k[1], xanadus: true};
            }),
            robots: props.robots.map(function(k){
                return {x: k[0], y: k[1], xanadus: false};
            }),
            selected: {x: -1, y: -1, xanadus: false},
            cdimension: JSON.stringify(props.dimension),
            cxanadus: JSON.stringify(props.xanadus),
            crobots: JSON.stringify(props.robots),
            preset: -1,
        };
        this.onselect = function(k) {
            return () => {
                this.setState({selected: k});
            }
        }
        this.onmove = function(x, y) {
            return () => {
                var lst = this.state.xanadus.concat(this.state.robots);
                var canmove = false;
                if (x == this.state.selected.x) {
                    for (var k of lst) {
                        if (x == k.x
                        && (k.y > this.state.selected.y && k.y == y + 1
                         || k.y < this.state.selected.y && k.y == y - 1)) {
                            // console.log("can move x");
                            canmove = true;
                            break;
                        }
                    }
                    // if (!canmove) {
                    //     console.log("no x");
                    // }
                }
                else if (y == this.state.selected.y) {
                    for (var k of lst) {
                        if (y == k.y
                        && (k.x > this.state.selected.x && k.x == x + 1
                         || k.x < this.state.selected.x && k.x == x - 1)) {
                            // console.log("can move y");
                            canmove = true;
                            break;
                        }
                    }
                    // if (!canmove) {
                    //     console.log("no y");
                    // }
                }
                if (canmove) {
                    // modify reference
                    if (this.state.selected.xanadus && x == this.state.dimension >> 1 && y == this.state.dimension >> 1) {
                        this.state.selected.x = -1;
                        this.state.selected.y = -1;
                    }
                    else {
                        this.state.selected.x = x;
                        this.state.selected.y = y;
                    }
                    this.setState({selected: this.state.selected});
                }
            }
        }
        this.ondimchange = (e) => {
                this.setState({cdimension: e.target.value});
        }
        this.translate = function(s) {
            var r = "";
            for (var k of s) {
                if (k == "(")
                    r += "["
                else if (k == ")")
                    r += "]"
                else
                    r += k;
            }
            console.log(r);
            return r;
        }
        this.onxchange = (e) => {
            this.setState({cxanadus: this.translate(e.target.value)});
        }
        this.onrchange = (e) => {
            this.setState({crobots: this.translate(e.target.value)});
        }
        this.onset = () => {
            this.setState({
                dimension: parseInt(this.state.cdimension),
                xanadus: JSON.parse(this.state.cxanadus).map(function(k){
                    return {x: k[0], y: k[1], xanadus: true};
                }),
                robots: JSON.parse(this.state.crobots).map(function(k){
                    return {x: k[0], y: k[1], xanadus: false};
                }),
            });
        }
        this.onpresetchange = (e) => {
            this.setState({preset: e.target.value});
        }
        this.onpreset = () => {
            if (this.state.preset < 0 || this.state.preset >= levels.length)
                return;
            var preset = levels[this.state.preset];
            this.setState((prev, props) => ({
                dimension: preset[0],
                crobots: JSON.stringify(preset[1]),
                cxanadus: JSON.stringify(preset[2]),
            }));
            this.onset();
        }
    }
    render() {
        var grid = [];
        var header = [<Btn text="\" disabled={true}/>];
        for (var i = 0; i < this.state.dimension; i++) {
            header.push(<Btn text={i} disabled={true}/>);
        }
        grid.push(header);
        for (var i = 0; i < this.state.dimension; i++) {
            var row = [];
            for (var j = 0; j < this.state.dimension; j++) {
                var blank = true;
                var overlap = false;
                for (var k = 0; k < this.state.robots.length; k++) {
                    if (this.state.robots[k].x == j && this.state.robots[k].y == i) {
                        if (i == this.state.dimension >> 1 && j == this.state.dimension >> 1) {
                            row.push(<Btn text="◈" onclick={this.onselect(this.state.robots[k])} />);
                            overlap = true;
                        }
                        else {
                            row.push(<Btn text="◆" onclick={this.onselect(this.state.robots[k])}/>);
                        }
                        blank = false;
                        break;
                    }
                }
                for (var k = 0; k < this.state.xanadus.length; k++) {
                    if (this.state.xanadus[k].x == j && this.state.xanadus[k].y == i) {
                        row.push(<Btn text="▣" onclick={this.onselect(this.state.xanadus[k])} />);
                        blank = false;
                        break;
                    }
                }
                if (!overlap && i == this.state.dimension >> 1 && j == this.state.dimension >> 1) {
                    row.push(<Btn text="◍" onclick={this.onmove(j, i)} />);
                }
                else if (blank) {
                    row.push(<Btn text="&nbsp;" onclick={this.onmove(j, i)} />);
                }
            }
            grid.push(<tr><Btn text={i} disabled={true}/> {row}</tr>);
        }
        return (
            <div>
                <table id="legend">
                    <tr><td>Legend:</td><td>Meaning</td></tr>
                    <tr><td>▣</td><td>Xanadus</td></tr>
                    <tr><td>◆</td><td>Robot</td></tr>
                    <tr><td>◍</td><td>Center</td></tr>
                    <tr><td>◈</td><td>Robot overlaps with center</td></tr>
                    <tr><td><b>Note</b>:</td> <td>There is no error-checking on your data, use wisely.</td></tr>
                </table>
                <table style={{textAlign: "left"}}>
                <tr><td>dimension: </td><td><input onChange={this.ondimchange} type="text" value={this.state.cdimension}/></td></tr>
                <tr><td></td><td>Enter dimension here</td></tr>
                <tr><td>xanadus: </td><td><input onChange={this.onxchange} type="text" value={this.state.cxanadus}/></td></tr>
                <tr><td></td><td>Enter xanadus coordinates here, or copy/paste from starter code</td></tr>
                <tr><td>robots: </td><td><input onChange={this.onrchange} type="text" value={this.state.crobots}/></td></tr>
                <tr><td></td><td>Enter robots coordinates here, or copy/paste from starter code</td></tr>
                </table>
                <div>
                <button id="bset" onClick={this.onset}>set</button>
                <div>
                    Use "set" to set the state, or to restart at this state if you messed up
                </div>
                <div>
                    Or select a preset from 0 to {levels.length - 1} <input type="number" min="0" max={levels.length} onChange={this.onpresetchange} /> <button id="bset" onClick={this.onpreset}>Apply preset</button>
                </div>
                </div>
                <table>
                    {grid}
                </table>
                <span>Selected: ({this.state.selected.x}, {this.state.selected.y})</span>
            </div>
        );
    }
}
ReactDOM.render(<Lockout dimension={7} xanadus={[[2, 0],[3, 0],[4, 0]]} robots={[[2, 1], [0 ,2], [1 ,2], [6, 4], [2, 5]]} />, document.getElementById("root"));
// ReactDOM.render(<Lockout dimension={5} xanadus={[[4, 4]]} robots={[[4, 0], [2, 1], [1, 2], [3, 3]]} />, document.getElementById("easy"));
// ReactDOM.render(<Lockout dimension={5} xanadus={[[0, 1]]} robots={[[0, 0], [1, 0],[2,2],[4,2],[0,4],[4,4]]} />, document.getElementById("root"));