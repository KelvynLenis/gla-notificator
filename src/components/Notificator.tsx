import { useEffect, useState } from 'react';
import { Job, scheduleJob } from 'node-schedule';
import notificationSound from '../assets/notification.mp3';
import dayjs from 'dayjs';

const islandEventTimes = ['00:06', '00:36', '01:06', '01:36', '02:06', 
                          '02:36', '03:06', '03:36', '04:06', '04:36', 
                          '05:06', '05:36', '06:06', '06:36', '07:06', 
                          '07:36', '08:06', '08:36', '09:06', '09:36', 
                          '10:06', '10:36', '11:06', '11:36', '12:06', 
                          '12:36', '13:06', '13:36', '14:06', '14:36', 
                          '15:06', '15:36', '16:06', '16:36', '17:06', 
                          '17:36', '18:06', '18:36', '19:06', '19:36', 
                          '20:06', '20:36', '21:06', '21:36', '22:06', 
                          '22:36', '23:06', '23:36'];

const wantedPirateTimes = ['00:36', '02:36', '04:36', '06:36', '08:36', 
                          '10:36', '12:36', '14:36', '16:36', '18:36', 
                          '20:36', '22:36'];

function Notificator() {
  const [isIslandEventActive, setIsIslandEventActive] = useState(false);
  const [isWantedPirateActive, setIsWantedPirateActive] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [nextIslandEvent, setNextIslandEvent] = useState<string>('');
  const [nextWantedPirate, setNextWantedPirate] = useState<string>('');

  const wpJobs: Job[] = [];
  const islandJobs: Job[] = [];
  
  const audio = new Audio(notificationSound);

  function requestPermission() {
    Notification.requestPermission()
  }

  function notify(title: string) {
    audio.play();
    new Notification('GLA Notificator', {
      body: `${title}`
    })
    title === 'Evento de ilha resetado' ? islandJobs.shift() : wpJobs.shift();
    setNotificationsCount(notificationsCount + 1);
  }

  function scheduleNextIslandEvent(){
    const queue = makeIslandEventQueue();
    const now = dayjs();

    const filteredQueue = queue.filter((checkpoint) => checkpoint.time.isAfter(now));
    
    if(filteredQueue.length > 0){
      const nextHour = filteredQueue[0].time.hour();
      const nextMinute = filteredQueue[0].time.minute();
      const job = scheduleJob({ hour: nextHour, minute: nextMinute }, () => notify(filteredQueue[0].title));
      islandJobs.push(job);

      const hour = filteredQueue[0].time.hour() < 10 ? '0' + filteredQueue[0].time.hour() : filteredQueue[0].time.hour();
      const minute = filteredQueue[0].time.minute() < 10 ? '0' + filteredQueue[0].time.minute() : filteredQueue[0].time.minute();
      setNextIslandEvent(hour + ':' + minute);
    }
  }

  function makeIslandEventQueue() {
    const initialTime = dayjs().set('hour', 0).set('minute', 6).set('second', 0);
    const finalTime = dayjs().set('hour', 23).set('minute', 6).set('second', 0);  
    const numberOfAlarms = islandEventTimes.length;
      
    const queue = [];
    let time = initialTime;
    const now = dayjs();
    
    for (let i = 0; i < numberOfAlarms; i++) {
      time = dayjs().hour(time.hour()).minute(time.minute() + 30).second(0).millisecond(0)
      
      if (time.isAfter(finalTime)) {
        break;
      }
  
      if(now.isBefore(time)){
        const checkpoint = {
          time: time,
          title:'Evento de ilha resetado'
        }
        queue.push(checkpoint);
      }      
    }
  
    return queue; 
  }

  function makeWPQueue() {
    const initialTime = dayjs().set('hour', 0).set('minute', 36).set('second', 0);
    const finalTime = dayjs().set('hour', 23).set('minute', 36).set('second', 0);
    const numberOfAlarms = wantedPirateTimes.length;
      
    const queue = [];
    let time = initialTime;
    const now = dayjs();
    
    for (let i = 0; i < numberOfAlarms; i++) {
      time = dayjs().hour(time.hour() + 2).minute(time.minute()).second(0).millisecond(0)
      

      if (time.isAfter(finalTime)) {
        break;
      }

      if(now.isBefore(time)){
        const checkpoint = {
          time: time,
          title:'Piratas procurados resetado'
        }
        queue.push(checkpoint);
      }
    }
  
    return queue;
  }

  function scheduleNextWantedPirate(){
    const queue = makeWPQueue();

    const now = dayjs();
    
    const filteredQueue = queue.filter((checkpoint) => checkpoint.time.isAfter(now));
    
    
    if(filteredQueue.length > 0){
      const nextHour = filteredQueue[0].time.hour();
      const nextMinute = filteredQueue[0].time.minute();
      const job = scheduleJob({ hour: nextHour, minute: nextMinute }, () => notify(filteredQueue[0].title));
      wpJobs.push(job);

      const hour = filteredQueue[0].time.hour() < 10 ? '0' + filteredQueue[0].time.hour() : filteredQueue[0].time.hour();
      const minute = filteredQueue[0].time.minute() < 10 ? '0' + filteredQueue[0].time.minute() : filteredQueue[0].time.minute();
      setNextWantedPirate(hour + ':' + minute);
    }
  }

  useEffect(() => {
    if(islandJobs.length > 0){
      islandJobs.map((job) => job.cancel());
    }
    if(wpJobs.length > 0){
      wpJobs.map((job) => job.cancel());
    }

    requestPermission();
  }, [])

  useEffect(() => {
    if(islandJobs.length > 0){
      islandJobs.map((job) => job.cancel());
    }
    if(wpJobs.length > 0){
      wpJobs.map((job) => job.cancel());
    }

    if (isIslandEventActive) {
      scheduleNextIslandEvent();
    } else {
      islandJobs.map((job) => job.cancel());
      setNextIslandEvent('');
    }

    if (isWantedPirateActive) {
      scheduleNextWantedPirate();
    } else {
      wpJobs.map((job) => job.cancel());
      setNextWantedPirate('');
    }
  }, [isIslandEventActive, isWantedPirateActive])

  return (
    <div className="flex flex-col items-start justify-center gap-2 text-xl">
      <div className="flex gap-2 w-72 md:w-full">
        <span aria-checked={isIslandEventActive} className='w-28 bg-zinc-800 border border-yellow-500 rounded-md px-1 aria-checked:bg-yellow-500 aria-checked:text-black aria-checked:border-yellow-300 font-bold'>{isIslandEventActive ? 'On' : 'Off'}</span>
        <button className="w-80 h-full bg-black border border-yellow-300 rounded-md hover:bg-yellow-300 hover:border-black hover:text-black" onClick={() => setIsIslandEventActive(!isIslandEventActive)}>Acionar Alerta de Island Event</button>
      </div>
      <div className="flex gap-2 w-72 md:w-full">
        <span aria-checked={isWantedPirateActive} className='w-28 bg-zinc-800 border border-yellow-500 rounded-md px-1 aria-checked:bg-yellow-500 aria-checked:text-black font-bold'>{isWantedPirateActive ? 'On' : 'Off'}</span>
        <button className="w-80 px-1 h-full bg-black border border-yellow-300 rounded-md hover:bg-yellow-300 hover:border-black hover:text-black aria-checked:border-yellow-300" onClick={() => setIsWantedPirateActive(!isWantedPirateActive)}>Acionar Alerta de Wanted Pirate</button>
      </div>
      <div className='w-full flex items-center justify-center gap-2'>
        <div className='flex flex-col items-center gap-5 mt-2 w-44 md:w-fit'>
          <span className='font-bold bg-zinc-900 px-2 rounded-md'>Próximo evento de ilha: </span>
          <span aria-checked={nextIslandEvent?.length === 0} className='flex w-fit bg-zinc-900 rounded-full px-3 py-1 aria-checked:hidden'>{nextIslandEvent}</span>
        </div>
        <div className='flex flex-col items-center gap-4 mt-2 w-44 md:w-fit'>
          <span className='font-bold bg-zinc-900 px-2 rounded-md'>Próximo Wanted Pirate: </span>
          <span aria-checked={nextWantedPirate?.length === 0} className='flex w-fit bg-zinc-900 rounded-full px-3 py-1 aria-checked:hidden'>{nextWantedPirate}</span>
        </div>
      </div>
      <div className='w-full flex items-center justify-center'>
        <span className='flex w-fit bg-zinc-900 rounded-full px-3 py-1'>Notificações: {notificationsCount}</span>
      </div>
      
      {/* <div className="flex gap-2">
        <input className="w-28 text-base bg-zinc-900 rounded-lg p-1 border border-yellow-300 " value={time} onChange={e => setTime(e.target.value)} type="time" />
        <button className="w-80 h-full bg-black border border-yellow-300 rounded-md hover:bg-yellow-300 hover:border-black hover:text-black" onClick={activateCustom}>Acionar Alerta Customizado</button>
      </div> */}
    </div>
  )
}

export default Notificator