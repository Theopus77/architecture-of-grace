
window.aogSharePilot=function(){
  var es=((document.documentElement.getAttribute('lang')||'en').slice(0,2)==='es');
  var url='https://architectureofgrace.com/#pilot';
  var subj=es?'Vale la pena verlo para nuestra escuela — Architecture of Grace':'Worth a look for our school — Architecture of Grace';
  var body=es?
'Hola:\n\nEncontr\u00e9 algo que vale la pena ver para nuestra escuela: Architecture of Grace, un marco SEL con privacidad primero, creado por un educador especial en ejercicio. Los check-ins toman unos cinco minutos, no hay cuentas de estudiantes y el piloto dura un semestre.\n\nResumen breve (PDF): https://architectureofgrace.com/pilot/AoG-Pilot-Overview.pdf\nP\u00e1gina del piloto: https://architectureofgrace.com/#pilot\nEn espa\u00f1ol: https://architectureofgrace.com/es/\n\n\u00bfCinco minutos para verlo?':
'Hi,\n\nI found something worth a look for our school: Architecture of Grace — a privacy-first SEL framework built by a practicing special educator. Check-ins take about five minutes, there are no student accounts, and the pilot runs for one semester.\n\nThe short overview (PDF): https://architectureofgrace.com/pilot/AoG-Pilot-Overview.pdf\nThe pilot page: https://architectureofgrace.com/#pilot\nEn espa\u00f1ol: https://architectureofgrace.com/es/\n\nWorth five minutes?';
  try{ if(navigator.share){ navigator.share({title:subj,text:body,url:url}); return; } }catch(e){}
  location.href='mailto:?subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(body);
};
