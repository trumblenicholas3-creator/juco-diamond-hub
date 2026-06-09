-- Allow athletes to see how many times their profile was saved
create policy "Athletes can count their own saves"
  on saved_prospects for select
  using (
    athlete_id in (
      select id from athletes where user_id = auth.uid()
    )
    OR coach_id = auth.uid()
  );
