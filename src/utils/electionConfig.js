// ✅ แก้ไข: ระบุ Timezone +07:00 ต่อท้าย
export const ELECTION_CONFIG = {
  CAMPAIGN_START: new Date('2026-01-13T08:30:00+07:00'), 

  ELECTION_START: new Date('2026-01-17T08:30:00+07:00'), 

  // สมมติปรับเป็นตี 1 ของวันที่ 18 (วันนี้) เพื่อให้สถานะเป็น ENDED
  ELECTION_END: new Date('2026-01-18T01:00:00+07:00'), 
};