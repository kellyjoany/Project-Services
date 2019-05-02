// eslint-disable-next-line func-names
document.getElementById('date').onchange = function () {
  const stId = document.getElementById('stId').value;
  const daySchedule = document.getElementById('date').value;
  const arrSchedules = ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  axios.get(`http://localhost:3000/api/${stId}`)
    .then((response) => {
      document.getElementById('stHr').innerHTML = '';
      response.data.schedules.forEach((e) => {
        if (e.bookingDay === daySchedule) {
          for (let i = 0; i < arrSchedules.length; i += 1) {
            if (arrSchedules[i] === e.bookingHour) {
              arrSchedules.splice([i], 1);
            }
          }
        }
      });
      for (let j = 0; j < arrSchedules.length; j += 1) {
        document.getElementById('stHr').innerHTML += `<option value="${arrSchedules[j]}">${arrSchedules[j]}</option>`;
      }
    })
    .catch((err) => {
      throw new Error(err);
    });
};

// eslint-disable-next-line func-names
document.getElementById('dateEdit').onchange = function () {
  const stIdEdit = document.getElementById('stIdEdit').value;
  const daySchedule = document.getElementById('dateEdit').value;
  console.log(stIdEdit);
  const arrSchedules = ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  axios.get(`http://localhost:3000/api/${stIdEdit}`)
    .then((response) => {
      document.getElementById('stHrEdit').innerHTML = '';
      response.data.schedules.forEach((e) => {
        if (e.bookingDay === daySchedule) {
          for (let i = 0; i < arrSchedules.length; i += 1) {
            if (arrSchedules[i] === e.bookingHour) {
              arrSchedules.splice([i], 1);
            }
          }
        }
      });
      for (let j = 0; j < arrSchedules.length; j += 1) {
        document.getElementById('stHrEdit').innerHTML += `<option value="${arrSchedules[j]}">${arrSchedules[j]}</option>`;
      }
    })
    .catch((err) => {
      throw new Error(err);
    });
};

flatpickr('.flatpickr',{
  minDate: new Date(),
  dateFormat: 'd/m/Y'
})

function validateMyFormSchedule(){
  alert("Schedule Done! Please Check your Email :)");
  return true;
}

function validateMyFormScheduleEdited(){
  alert("Schedule Edited!");
  return true;
}
