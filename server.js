const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(__dirname + '/public'));

// 비밀번호 및 데이터 설정
const rawLeaders = [
    { name: "박상우", points: 1600, pw: "1345" },
    { name: "박규현", points: 1800, pw: "2468" },
    { name: "최병주", points: 1750, pw: "3579" },
    { name: "박찬영", points: 1700, pw: "4680" },
    { name: "서민우", points: 1750, pw: "5791" },
    { name: "김대현", points: 1800, pw: "6802" },
    { name: "한진우", points: 1750, pw: "7913" },
    { name: "나덕용", points: 1700, pw: "8024" },
    { name: "서민준", points: 1700, pw: "9135" },
    { name: "송기연", points: 1750, pw: "1029" },
    { name: "강민서", points: 1800, pw: "2130" },
    { name: "김건희", points: 1850, pw: "3241" }
];
const HOST_PW = "7788";

const lineOrderedMembers = [
    { name: "김승건", line: "TOP", rank: 1, tier: "마스터" },
    { name: "김민영", line: "TOP", rank: 2, tier: "마스터" },
    { name: "유재원", line: "TOP", rank: 3, tier: "다이아" },
    { name: "문서진", line: "TOP", rank: 4, tier: "다이아" },
    { name: "한재진", line: "TOP", rank: 5, tier: "골드" },
    { name: "이상준", line: "TOP", rank: 6, tier: "골드" },

    { name: "김기진", line: "JGL", rank: 1, tier: "챌린저" },
    { name: "이재석", line: "JGL", rank: 2, tier: "마스터" },
    { name: "강병현", line: "JGL", rank: 3, tier: "마스터" },
    { name: "김문수", line: "JGL", rank: 4, tier: "마스터" },
    { name: "김현준", line: "JGL", rank: 5, tier: "다이아" },
    { name: "신우현", line: "JGL", rank: 6, tier: "다이아" },
    { name: "동도영", line: "JGL", rank: 7, tier: "다이아" },
    { name: "김지상", line: "JGL", rank: 8, tier: "에메랄드" },
    { name: "박태현", line: "JGL", rank: 9, tier: "에메랄드" },
    { name: "남선우", line: "JGL", rank: 10, tier: "플래티넘" },
    { name: "김민규", line: "JGL", rank: 11, tier: "플래티넘" },
    { name: "김명준", line: "JGL", rank: 12, tier: "플래티넘" },

    { name: "윤태현", line: "MID", rank: 1, tier: "마스터" },
    { name: "염지호", line: "MID", rank: 2, tier: "마스터" },
    { name: "이지원", line: "MID", rank: 3, tier: "마스터" },
    { name: "강준경", line: "MID", rank: 4, tier: "에메랄드" },
    { name: "윤지성", line: "MID", rank: 5, tier: "에메랄드" },
    { name: "이정은", line: "MID", rank: 6, tier: "플래티넘" },
    { name: "하연우", line: "MID", rank: 7, tier: "골드" },

    { name: "강현준", line: "ADC", rank: 1, tier: "마스터" },
    { name: "김희섭", line: "ADC", rank: 2, tier: "마스터" },
    { name: "김언중", line: "ADC", rank: 3, tier: "마스터" },
    { name: "김상우", line: "ADC", rank: 4, tier: "마스터" },
    { name: "이건우", line: "ADC", rank: 5, tier: "다이아" },
    { name: "채승병", line: "ADC", rank: 6, tier: "다이아" },
    { name: "김경태", line: "ADC", rank: 7, tier: "다이아" },
    { name: "최상연", line: "ADC", rank: 8, tier: "다이아" },
    { name: "한재성", line: "ADC", rank: 9, tier: "에메랄드" },
    { name: "김대휘", line: "ADC", rank: 10, tier: "플래티넘" },
    { name: "김선진", line: "ADC", rank: 11, tier: "플래티넘" },
    { name: "조진우", line: "ADC", rank: 12, tier: "플래티넘" },
    { name: "권오창", line: "ADC", rank: 13, tier: "골드" },

    { name: "이산", line: "SUP", rank: 1, tier: "그랜드마스터" },
    { name: "김재영", line: "SUP", rank: 2, tier: "다이아" },
    { name: "정재경", line: "SUP", rank: 3, tier: "다이아" },
    { name: "임현지", line: "SUP", rank: 4, tier: "다이아" },
    { name: "박지현", line: "SUP", rank: 5, tier: "다이아" },
    { name: "곽지혜", line: "SUP", rank: 6, tier: "다이아" },
    { name: "조수빈", line: "SUP", rank: 7, tier: "에메랄드" },
    { name: "문서정", line: "SUP", rank: 8, tier: "플래티넘" },
    { name: "임서영", line: "SUP", rank: 9, tier: "골드" },
    { name: "심인혜", line: "SUP", rank: 10, tier: "실버" }
];

function shuffle(array) {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// 실시간 상태 관리 변수
let state = {
    teams: [],
    publicQueue: [],
    hiddenQueue: [],
    currentAuctionPlayer: null,
    currentBid: 0,
    highestBidder: null,
    auctionActive: false,
    timerRunning: false,
    timeLeft: 5.0,
    auctionIndex: 0,
    logs: [],
    history: []
};

let timerInterval = null;

function initAuction() {
    clearInterval(timerInterval);
    state.teams = rawLeaders.map((leader, id) => ({
        id: id,
        name: leader.name,
        points: leader.points,
        slots: []
    }));

    const shuffled = shuffle(lineOrderedMembers.map(m => ({ ...m })));
    state.publicQueue = shuffled.slice(0, 24);
    state.hiddenQueue = shuffled.slice(24);

    state.currentAuctionPlayer = null;
    state.currentBid = 0;
    state.highestBidder = null;
    state.auctionActive = false;
    state.timerRunning = false;
    state.timeLeft = 5.0;
    state.auctionIndex = 0;
    state.logs = ['경매가 초기화되었습니다.'];
    state.history = [];
}

initAuction();

function broadcastState() {
    io.emit('stateUpdate', state);
}

io.on('connection', (socket) => {
    socket.emit('stateUpdate', state);

    // 비밀번호 검증
    socket.on('verifyPassword', ({ targetId, password }, callback) => {
        let isValid = false;
        if (targetId === -1 && password === HOST_PW) isValid = true;
        else if (targetId >= 0 && rawLeaders[targetId] && rawLeaders[targetId].pw === password) isValid = true;
        callback({ success: isValid });
    });

    // 사회자: 다음 경매 시작
    socket.on('startNextAuction', () => {
        if (state.auctionActive) return;

        if (state.publicQueue.length > 0) {
            state.currentAuctionPlayer = state.publicQueue.shift();
        } else if (state.hiddenQueue.length > 0) {
            const randIdx = Math.floor(Math.random() * state.hiddenQueue.length);
            state.currentAuctionPlayer = state.hiddenQueue.splice(randIdx, 1)[0];
        } else {
            return;
        }

        state.auctionIndex++;
        state.currentBid = 0;
        state.highestBidder = null;
        state.auctionActive = true;
        state.timerRunning = false;
        state.timeLeft = 5.0;

        clearInterval(timerInterval);
        state.logs.unshift(`<b>#${state.auctionIndex} [${state.currentAuctionPlayer.name} (${state.currentAuctionPlayer.line} / ${state.currentAuctionPlayer.tier} / ${state.currentAuctionPlayer.rank}등)]</b> 경매 시작`);
        broadcastState();
    });

    // 팀장: 입찰
    socket.on('submitBid', ({ teamId, bidVal }) => {
        if (!state.auctionActive) return;
        const team = state.teams.find(t => t.id === teamId);
        if (!team) return;

        if (bidVal <= state.currentBid && state.currentBid > 0) return;
        if (team.points < bidVal || team.slots.length >= 4) return;

        state.currentBid = bidVal;
        state.highestBidder = team;

        clearInterval(timerInterval);
        state.timerRunning = false;
        state.timeLeft = 5.0;

        state.logs.unshift(`팀장 <b>${team.name}</b> 입찰: ${state.currentBid} pt (사회자 5초 시작 대기)`);
        broadcastState();
    });

    // 사회자: 5초 카운트다운 시작
    socket.on('startCountdown', () => {
        if (!state.auctionActive || state.timerRunning) return;

        state.timerRunning = true;
        state.timeLeft = 5.0;
        state.logs.unshift(`⏱️ 사회자가 5초 카운트다운을 시작했습니다!`);
        broadcastState();

        timerInterval = setInterval(() => {
            state.timeLeft -= 0.1;
            if (state.timeLeft <= 0) {
                state.timeLeft = 0;
                clearInterval(timerInterval);
                finalizeAuction();
            } else {
                io.emit('timerTick', { timeLeft: state.timeLeft });
            }
        }, 100);
    });

    // 경매 종료 처리
    function finalizeAuction() {
        state.auctionActive = false;
        state.timerRunning = false;

        if (state.highestBidder) {
            const t = state.teams.find(team => team.id === state.highestBidder.id);
            t.points -= state.currentBid;
            t.slots.push(state.currentAuctionPlayer);

            state.logs.unshift(`<span style="color:#e5b849;"><b>[낙찰]</b> ${state.currentAuctionPlayer.name} (${state.currentAuctionPlayer.line}) -> ${t.name} (${state.currentBid} pt)</span>`);
            state.history.unshift({ player: `${state.currentAuctionPlayer.name} (${state.currentAuctionPlayer.line})`, result: t.name, price: `${state.currentBid} pt` });
        } else {
            state.logs.unshift(`<span style="color:#ff4655;"><b>[유찰]</b> ${state.currentAuctionPlayer.name} (입찰자 없음) -> 비공개 대기열 이동</span>`);
            state.history.unshift({ player: state.currentAuctionPlayer.name, result: '유찰', price: '-' });
            state.hiddenQueue.push(state.currentAuctionPlayer);
        }

        state.currentAuctionPlayer = null;
        broadcastState();
    }

    // 사회자: 강제 유찰
    socket.on('forcePass', () => {
        if (!state.auctionActive) return;
        clearInterval(timerInterval);
        state.highestBidder = null;
        finalizeAuction();
    });

    // 사회자: 순서 섞기
    socket.on('shuffleMembers', () => {
        if (state.auctionActive) return;
        const fullShuffled = shuffle([...state.publicQueue, ...state.hiddenQueue]);
        state.publicQueue = fullShuffled.slice(0, 24);
        state.hiddenQueue = fullShuffled.slice(24);
        state.logs.unshift('🎲 전체 매물(1~48번)이 무작위로 새로 섞였습니다.');
        broadcastState();
    });

    // 사회자: 경매 리셋
    socket.on('resetAuction', () => {
        initAuction();
        broadcastState();
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`경매 서버 구동 중: http://localhost:${PORT}`);
});