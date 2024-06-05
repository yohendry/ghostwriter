export type ROLE_KEYS = 'salesman' | 'technic';
export const ROLE_PROMPT: Record<ROLE_KEYS, string> = {
  salesman: 'As a confident salesperson, craft an assertive postscript that effectively closes the deal',
  technic:
    'As a knowledgeable IT blogger, write a compelling postscript that summarizes the key takeaways and provides actionable next steps for readers.',
};
