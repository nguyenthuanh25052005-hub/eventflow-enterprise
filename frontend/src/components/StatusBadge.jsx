const tones={
 ACTIVE:'green',APPROVED:'green',COMPLETED:'green',DONE:'green',CHECKED_IN:'green',ON_TRACK:'green',PAID:'green',
 NEW:'blue',PLANNING:'blue',CONFIRMED:'blue',REGISTERED:'blue',SENT:'blue',
 QUALIFYING:'purple',QUOTATION:'purple',REVIEW:'purple',
 NEGOTIATING:'amber',PENDING:'amber',IN_PROGRESS:'amber',AT_RISK:'amber',HIGH:'amber',MEDIUM:'blue',LOW:'gray',
 URGENT:'red',CRITICAL:'red',REJECTED:'red',CANCELLED:'red',BLOCKED:'red',OVERDUE:'red',
 DRAFT:'gray',INACTIVE:'gray',TODO:'gray',EXPIRED:'gray'
};
export default function StatusBadge({value,label}){const t=tones[value]||'gray';return <span className={`badge badge-${t}`}>{label||String(value||'—').replaceAll('_',' ')}</span>}
