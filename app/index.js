import { BodyPresenceSensor } from 'body-presence';
import clock from 'clock';
import { display } from 'display';
import document from 'document';
import { HeartRateSensor } from 'heart-rate';
import { me } from 'appbit';
import { preferences } from 'user-settings';
import { today } from 'user-activity';

const imageNamePrefix = '32x32_';
const imageExtension = '.png';
const score1 = document.getElementById('score1');
const score2 = document.getElementById('score2');
const score3 = document.getElementById('score3');
const score4 = document.getElementById('score4');
const score5 = document.getElementById('score5');
const hours1 = document.getElementById('hours1');
const hours2 = document.getElementById('hours2');
const minutes1 = document.getElementById('minutes1');
const minutes2 = document.getElementById('minutes2');

let hrm;
let body;

if (HeartRateSensor) {
  hrm = new HeartRateSensor({ frequency: 1 });
  hrm.addEventListener('reading', () => {
    // update number if hearts based on your heart rate
    const numberOfHeart = hrm.heartRate / 10;

    for (let i = 1; i <= 15; i++) {
      document.getElementById(`h${i}`).style.visibility =
        numberOfHeart >= i ? 'visible' : 'hidden';
    }
  });
  hrm.start();
} else {
  hideHearts();
}

if (BodyPresenceSensor) {
  body = new BodyPresenceSensor();
  body.addEventListener('reading', () => {
    if (!body.present) {
      hrm ? hrm.stop() : {};
      hideHearts();
    } else {
      hrm ? hrm.start() : {};
      showHearts();
    }
  });
  body.start();
}

// Update the clock every minute
clock.granularity = 'minutes';

// Update the <text> element every tick with the current time
clock.ontick = evt => {
  const d = evt.date;
  const hours = d.getHours();
  if (preferences.clockDisplay === '12h') {
    // 12h format
    hours = hours % 12 || 12;
  }
  // const mins = util.zeroPad(d.getMinutes());
  const mins = d.getMinutes();
  setOne(mins, minutes1);
  setTen(mins, minutes2);
  setOne(hours, hours1);
  setTen(hours, hours2);

  updateScore();
};

if (display.aodAvailable && me.permissions.granted('access_aod')) {
  // tell the system we support AOD
  display.aodAllowed = true;

  // respond to display change events
  display.addEventListener('change', () => {
    // Is AOD inactive and the display is on?
    if (!display.aodActive && display.on && HeartRateSensor) {
      // Show elements & start sensors
      hrm.start();
      showHearts();
      document.getElementById('scoreArea').style.display = 'inline';
      body.start();
    } else {
      // Hide elements & stop sensors
      hrm.stop();
      hideHearts();
      document.getElementById('scoreArea').style.display = 'none';
      body.stop();
    }
  });
}

function updateScore() {
  const steps = today.adjusted.steps;
  setOne(steps, score1);
  setTen(steps, score2);
  setHundred(steps, score3);
  setThousand(steps, score4);
  setTenThousand(steps, score5);
}

function setOne(val, target) {
  drawDigit(Math.floor(val % 10), target);
}

function setTen(val, target) {
  drawDigit(Math.floor(Math.floor(val % 100) / 10), target);
}

function setHundred(val, target) {
  drawDigit(Math.floor(Math.floor(val % 1000) / 100), target);
}

function setThousand(val, target) {
  drawDigit(Math.floor(Math.floor(val % 10000) / 1000), target);
}

function setTenThousand(val, target) {
  drawDigit(Math.floor(val / 10000), target);
}

function drawDigit(val, target) {
  target.image = `${imageNamePrefix}${val}${imageExtension}`;
}

function hideHearts() {
  document.getElementById('hrArea').style.display = 'none';
}

function showHearts() {
  document.getElementById('hrArea').style.display = 'inline';
}
