-- BiometricCredential_credentialId_idx
CREATE INDEX "BiometricCredential_credentialId_idx" ON public."BiometricCredential" USING btree ("credentialId");
-- Coupon_code_idx
CREATE INDEX "Coupon_code_idx" ON public."Coupon" USING btree (code);
-- Schedule_userId_idx
CREATE INDEX "Schedule_userId_idx" ON public."Schedule" USING btree (user_id);
-- SeasonParticipation_userId_seasonId_idx
CREATE INDEX "SeasonParticipation_userId_seasonId_idx" ON public."SeasonParticipation" USING btree ("userId", "seasonId");
-- SubjectEnrollment_active_enrollment_idx
CREATE UNIQUE INDEX "SubjectEnrollment_active_enrollment_idx" ON public."SubjectEnrollment" USING btree (user_id, subject_id) WHERE ("isDeleted" = false);
-- Teacher_userId_idx
CREATE INDEX "Teacher_userId_idx" ON public."Teacher" USING btree ("userId");
-- TopicProgress_userId_subTopicId_key
CREATE UNIQUE INDEX "TopicProgress_userId_subTopicId_key" ON public."TopicProgress" USING btree (user_id, sub_topic_id);
-- examresult_p2026_02_user_id_taken_at_idx1
CREATE INDEX examresult_p2026_02_user_id_taken_at_idx1 ON public.examresult_p2026_02 USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- examresult_p2026_02_user_id_taken_at_idx2
CREATE INDEX examresult_p2026_02_user_id_taken_at_idx2 ON public.examresult_p2026_02 USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- examresult_p2026_02_user_id_taken_at_idx3
CREATE INDEX examresult_p2026_02_user_id_taken_at_idx3 ON public.examresult_p2026_02 USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- examresult_p2026_03_user_id_taken_at_idx1
CREATE INDEX examresult_p2026_03_user_id_taken_at_idx1 ON public.examresult_p2026_03 USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- examresult_p2026_03_user_id_taken_at_idx2
CREATE INDEX examresult_p2026_03_user_id_taken_at_idx2 ON public.examresult_p2026_03 USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- examresult_p2026_03_user_id_taken_at_idx3
CREATE INDEX examresult_p2026_03_user_id_taken_at_idx3 ON public.examresult_p2026_03 USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- examresult_p2026_04_user_id_taken_at_idx1
CREATE INDEX examresult_p2026_04_user_id_taken_at_idx1 ON public.examresult_p2026_04 USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- examresult_p2026_04_user_id_taken_at_idx2
CREATE INDEX examresult_p2026_04_user_id_taken_at_idx2 ON public.examresult_p2026_04 USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- examresult_p2026_04_user_id_taken_at_idx3
CREATE INDEX examresult_p2026_04_user_id_taken_at_idx3 ON public.examresult_p2026_04 USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- examresult_p2026_05_user_id_taken_at_idx1
CREATE INDEX examresult_p2026_05_user_id_taken_at_idx1 ON public.examresult_p2026_05 USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- examresult_p2026_05_user_id_taken_at_idx2
CREATE INDEX examresult_p2026_05_user_id_taken_at_idx2 ON public.examresult_p2026_05 USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- examresult_p2026_05_user_id_taken_at_idx3
CREATE INDEX examresult_p2026_05_user_id_taken_at_idx3 ON public.examresult_p2026_05 USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- examresult_p2026_06_user_id_taken_at_idx1
CREATE INDEX examresult_p2026_06_user_id_taken_at_idx1 ON public.examresult_p2026_06 USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- examresult_p2026_06_user_id_taken_at_idx2
CREATE INDEX examresult_p2026_06_user_id_taken_at_idx2 ON public.examresult_p2026_06 USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- examresult_p2026_06_user_id_taken_at_idx3
CREATE INDEX examresult_p2026_06_user_id_taken_at_idx3 ON public.examresult_p2026_06 USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- examresult_p2026_07_user_id_taken_at_idx1
CREATE INDEX examresult_p2026_07_user_id_taken_at_idx1 ON public.examresult_p2026_07 USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- examresult_p2026_07_user_id_taken_at_idx2
CREATE INDEX examresult_p2026_07_user_id_taken_at_idx2 ON public.examresult_p2026_07 USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- examresult_p2026_07_user_id_taken_at_idx3
CREATE INDEX examresult_p2026_07_user_id_taken_at_idx3 ON public.examresult_p2026_07 USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- examresult_p2026_08_user_id_taken_at_idx1
CREATE INDEX examresult_p2026_08_user_id_taken_at_idx1 ON public.examresult_p2026_08 USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- examresult_p2026_08_user_id_taken_at_idx2
CREATE INDEX examresult_p2026_08_user_id_taken_at_idx2 ON public.examresult_p2026_08 USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- examresult_p2026_08_user_id_taken_at_idx3
CREATE INDEX examresult_p2026_08_user_id_taken_at_idx3 ON public.examresult_p2026_08 USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- examresult_p2026_09_user_id_taken_at_idx1
CREATE INDEX examresult_p2026_09_user_id_taken_at_idx1 ON public.examresult_p2026_09 USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- examresult_p2026_09_user_id_taken_at_idx2
CREATE INDEX examresult_p2026_09_user_id_taken_at_idx2 ON public.examresult_p2026_09 USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- examresult_p2026_09_user_id_taken_at_idx3
CREATE INDEX examresult_p2026_09_user_id_taken_at_idx3 ON public.examresult_p2026_09 USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- examresult_p2026_10_user_id_taken_at_idx1
CREATE INDEX examresult_p2026_10_user_id_taken_at_idx1 ON public.examresult_p2026_10 USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- examresult_p2026_10_user_id_taken_at_idx2
CREATE INDEX examresult_p2026_10_user_id_taken_at_idx2 ON public.examresult_p2026_10 USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- examresult_p2026_10_user_id_taken_at_idx3
CREATE INDEX examresult_p2026_10_user_id_taken_at_idx3 ON public.examresult_p2026_10 USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- examresult_p2026_11_user_id_taken_at_idx1
CREATE INDEX examresult_p2026_11_user_id_taken_at_idx1 ON public.examresult_p2026_11 USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- examresult_p2026_11_user_id_taken_at_idx2
CREATE INDEX examresult_p2026_11_user_id_taken_at_idx2 ON public.examresult_p2026_11 USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- examresult_p2026_11_user_id_taken_at_idx3
CREATE INDEX examresult_p2026_11_user_id_taken_at_idx3 ON public.examresult_p2026_11 USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- examresult_p2026_12_user_id_taken_at_idx1
CREATE INDEX examresult_p2026_12_user_id_taken_at_idx1 ON public.examresult_p2026_12 USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- examresult_p2026_12_user_id_taken_at_idx2
CREATE INDEX examresult_p2026_12_user_id_taken_at_idx2 ON public.examresult_p2026_12 USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- examresult_p2026_12_user_id_taken_at_idx3
CREATE INDEX examresult_p2026_12_user_id_taken_at_idx3 ON public.examresult_p2026_12 USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- examresult_pdefault_user_id_taken_at_idx1
CREATE INDEX examresult_pdefault_user_id_taken_at_idx1 ON public.examresult_pdefault USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- examresult_pdefault_user_id_taken_at_idx2
CREATE INDEX examresult_pdefault_user_id_taken_at_idx2 ON public.examresult_pdefault USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- examresult_pdefault_user_id_taken_at_idx3
CREATE INDEX examresult_pdefault_user_id_taken_at_idx3 ON public.examresult_pdefault USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- idx_Achievement_key
CREATE UNIQUE INDEX "idx_Achievement_key" ON public."Achievement" USING btree (key);
-- idx_BlogPost_slug
CREATE UNIQUE INDEX "idx_BlogPost_slug" ON public."BlogPost" USING btree (slug);
-- idx_Category_slug
CREATE UNIQUE INDEX "idx_Category_slug" ON public."Category" USING btree (slug);
-- idx_Challenge_subject_id
CREATE INDEX "idx_Challenge_subject_id" ON public."Challenge" USING btree (subject_id);
-- idx_Coupon_code
CREATE UNIQUE INDEX "idx_Coupon_code" ON public."Coupon" USING btree (code);
-- idx_Exam_subject_id
CREATE INDEX "idx_Exam_subject_id" ON public."Exam" USING btree (subject_id);
-- idx_Invoice_invoice_number
CREATE UNIQUE INDEX "idx_Invoice_invoice_number" ON public."Invoice" USING btree (invoice_number);
-- idx_Invoice_payment_id
CREATE UNIQUE INDEX "idx_Invoice_payment_id" ON public."Invoice" USING btree (payment_id);
-- idx_Invoice_user_id
CREATE INDEX "idx_Invoice_user_id" ON public."Invoice" USING btree (user_id);
-- idx_LessonAttachment_sub_topic_id
CREATE INDEX "idx_LessonAttachment_sub_topic_id" ON public."LessonAttachment" USING btree ("subTopicId");
-- idx_Payment_external_txn_id
CREATE INDEX "idx_Payment_external_txn_id" ON public."Payment" USING btree (external_txn_id);
-- idx_Payment_paymob_order_id
CREATE INDEX "idx_Payment_paymob_order_id" ON public."Payment" USING btree (paymob_order_id);
-- idx_Payment_reference
CREATE UNIQUE INDEX "idx_Payment_reference" ON public."Payment" USING btree (reference);
-- idx_Payment_status
CREATE INDEX "idx_Payment_status" ON public."Payment" USING btree (status);
-- idx_Payment_user_id
CREATE INDEX "idx_Payment_user_id" ON public."Payment" USING btree (user_id);
-- idx_Schedule_user_id
CREATE INDEX "idx_Schedule_user_id" ON public."Schedule" USING btree (user_id);
-- idx_Session_user_id
CREATE INDEX "idx_Session_user_id" ON public."Session" USING btree ("userId");
-- idx_SubTopic_topic_id
CREATE INDEX "idx_SubTopic_topic_id" ON public."SubTopic" USING btree (topic_id);
-- idx_Subject_slug
CREATE UNIQUE INDEX "idx_Subject_slug" ON public."Subject" USING btree (slug);
-- idx_Task_due_at
CREATE INDEX "idx_Task_due_at" ON public."Task" USING btree (due_at);
-- idx_Topic_subject_id
CREATE INDEX "idx_Topic_subject_id" ON public."Topic" USING btree (subject_id);
-- idx_UserAchievement_user_id
CREATE INDEX "idx_UserAchievement_user_id" ON public."UserAchievement" USING btree (user_id);
-- idx_UserSettings_user_id
CREATE UNIQUE INDEX "idx_UserSettings_user_id" ON public."UserSettings" USING btree (user_id);
-- idx_achievement_deleted_at
CREATE INDEX idx_achievement_deleted_at ON public."Achievement" USING btree (deleted_at);
-- idx_blocked_tokens_jti
CREATE INDEX idx_blocked_tokens_jti ON public.blocked_tokens USING btree (jti);
-- idx_blogpost_deleted_at
CREATE INDEX idx_blogpost_deleted_at ON public."BlogPost" USING btree (deleted_at);
-- idx_book_subject
CREATE INDEX idx_book_subject ON public."Book" USING btree ("subjectId");
-- idx_category_deleted_at
CREATE INDEX idx_category_deleted_at ON public."Category" USING btree (deleted_at);
-- idx_challenge_deleted_at
CREATE INDEX idx_challenge_deleted_at ON public."Challenge" USING btree (deleted_at);
-- idx_course_changelogs_version
CREATE INDEX idx_course_changelogs_version ON public.course_changelogs USING btree (subject_id, version DESC);
-- idx_course_pricing_subject_id
CREATE INDEX idx_course_pricing_subject_id ON public.course_pricing USING btree (subject_id);
-- idx_course_versions_latest
CREATE INDEX idx_course_versions_latest ON public.course_versions USING btree (subject_id, version_number DESC);
-- idx_coursereview_deleted_at
CREATE INDEX idx_coursereview_deleted_at ON public."CourseReview" USING btree (deleted_at);
-- idx_enrollment_user_deleted
CREATE INDEX idx_enrollment_user_deleted ON public."SubjectEnrollment" USING btree (user_id) WHERE (deleted_at IS NULL);
-- idx_exam_deleted_at
CREATE INDEX idx_exam_deleted_at ON public."Exam" USING btree (deleted_at);
-- idx_exam_result_user_taken
CREATE INDEX idx_exam_result_user_taken ON ONLY public."ExamResult" USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- idx_exam_result_user_taken_active
CREATE INDEX idx_exam_result_user_taken_active ON ONLY public."ExamResult" USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- idx_exam_result_user_taken_safe
CREATE INDEX idx_exam_result_user_taken_safe ON ONLY public."ExamResult" USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- idx_forum_category_order_safe
CREATE INDEX idx_forum_category_order_safe ON public."ForumCategory" USING btree ("order", created_at DESC) WHERE (deleted_at IS NULL);
-- idx_forum_topic_category_created_safe
CREATE INDEX idx_forum_topic_category_created_safe ON public."ForumTopic" USING btree (category_id, created_at DESC) WHERE (deleted_at IS NULL);
-- idx_http_metric_buckets_unique_bucket
CREATE UNIQUE INDEX idx_http_metric_buckets_unique_bucket ON public.http_metric_buckets USING btree (bucket_start, route, method, status);
-- idx_lesson_drip_sub_topic
CREATE INDEX idx_lesson_drip_sub_topic ON public.lesson_drip_schedules USING btree (sub_topic_id);
-- idx_lms_course_created_at_deleted
CREATE INDEX idx_lms_course_created_at_deleted ON public."LmsCourse" USING btree (created_at DESC) WHERE (deleted_at IS NULL);
-- idx_lms_course_status_deleted
CREATE INDEX idx_lms_course_status_deleted ON public."LmsCourse" USING btree (status) WHERE (deleted_at IS NULL);
-- idx_notification_created_desc
CREATE INDEX idx_notification_created_desc ON public."Notification" USING btree (created_at DESC);
-- idx_notification_is_read
CREATE INDEX idx_notification_is_read ON public."Notification" USING btree (is_read);
-- idx_notification_user_created_active
CREATE INDEX idx_notification_user_created_active ON public."Notification" USING btree (user_id, created_at DESC) WHERE (deleted_at IS NULL);
-- idx_notification_user_created_covering_active
CREATE INDEX idx_notification_user_created_covering_active ON public."Notification" USING btree (user_id, created_at DESC) INCLUDE (id, title, message, type, is_read, link, icon) WHERE (deleted_at IS NULL);
-- idx_notification_user_created_deleted
CREATE INDEX idx_notification_user_created_deleted ON public."Notification" USING btree (user_id, created_at DESC) WHERE (deleted_at IS NULL);
-- idx_notification_user_created_read_safe
CREATE INDEX idx_notification_user_created_read_safe ON public."Notification" USING btree (user_id, created_at DESC) INCLUDE (id, type, title, message, is_read) WHERE (deleted_at IS NULL);
-- idx_notification_user_unread
CREATE INDEX idx_notification_user_unread ON public."Notification" USING btree (user_id) WHERE (is_read = false);
-- idx_notification_user_unread_active
CREATE INDEX idx_notification_user_unread_active ON public."Notification" USING btree (user_id, created_at DESC) WHERE ((deleted_at IS NULL) AND (is_read = false));
-- idx_notification_user_unread_safe
CREATE INDEX idx_notification_user_unread_safe ON public."Notification" USING btree (user_id, created_at DESC) WHERE ((deleted_at IS NULL) AND (is_read = false));
-- idx_notifications_user_created
CREATE INDEX idx_notifications_user_created ON public."Notification" USING btree (user_id, created_at);
-- idx_notifications_user_id_status_delivered_sent
CREATE INDEX idx_notifications_user_id_status_delivered_sent ON public."Notification" USING btree (user_id, created_at DESC) WHERE (status = ANY (ARRAY['delivered'::text, 'sent'::text]));
-- idx_notifications_user_id_unread_partial
CREATE INDEX idx_notifications_user_id_unread_partial ON public."Notification" USING btree (user_id, created_at DESC) WHERE (is_read = false);
-- idx_payment_active_user_created
CREATE INDEX idx_payment_active_user_created ON public."Payment" USING btree (user_id, created_at DESC) WHERE (deleted_at IS NULL);
-- idx_payment_created_at_deleted
CREATE INDEX idx_payment_created_at_deleted ON public."Payment" USING btree (created_at DESC) WHERE (deleted_at IS NULL);
-- idx_payment_created_deleted
CREATE INDEX idx_payment_created_deleted ON public."Payment" USING btree (created_at DESC) WHERE (deleted_at IS NULL);
-- idx_payment_deleted_at
CREATE INDEX idx_payment_deleted_at ON public."Payment" USING btree (deleted_at);
-- idx_payment_failed_user
CREATE INDEX idx_payment_failed_user ON public."Payment" USING btree (user_id, created_at) WHERE (status = 'failed'::text);
-- idx_payment_pending_user
CREATE INDEX idx_payment_pending_user ON public."Payment" USING btree (user_id, created_at) WHERE (status = 'pending'::text);
-- idx_payment_plan_id
CREATE INDEX idx_payment_plan_id ON public."Payment" USING btree (plan_id);
-- idx_payment_subject
CREATE INDEX idx_payment_subject ON public."Payment" USING btree (subject_id);
-- idx_payment_user_created_covering_safe
CREATE INDEX idx_payment_user_created_covering_safe ON public."Payment" USING btree (user_id, created_at DESC) INCLUDE (amount, status) WHERE (deleted_at IS NULL);
-- idx_payment_user_created_desc
CREATE INDEX idx_payment_user_created_desc ON public."Payment" USING btree (user_id, created_at DESC);
-- idx_payment_user_status_active_safe
CREATE INDEX idx_payment_user_status_active_safe ON public."Payment" USING btree (user_id, status, created_at DESC) WHERE (deleted_at IS NULL);
-- idx_payment_user_status_created
CREATE INDEX idx_payment_user_status_created ON public."Payment" USING btree (user_id, status, created_at DESC) WHERE (deleted_at IS NULL);
-- idx_perf_notifications_user_created
CREATE INDEX idx_perf_notifications_user_created ON public."Notification" USING btree (user_id, created_at DESC);
-- idx_question_deleted_at
CREATE INDEX idx_question_deleted_at ON public."Question" USING btree (deleted_at);
-- idx_question_exam
CREATE INDEX idx_question_exam ON public."Question" USING btree (exam_id);
-- idx_reward_deleted_at
CREATE INDEX idx_reward_deleted_at ON public."Reward" USING btree (deleted_at);
-- idx_season_deleted_at
CREATE INDEX idx_season_deleted_at ON public."Season" USING btree (deleted_at);
-- idx_security_log_event_type_created
CREATE INDEX idx_security_log_event_type_created ON public."SecurityLog" USING btree (event_type, created_at DESC) WHERE (deleted_at IS NULL);
-- idx_securitylog_deleted_at
CREATE INDEX idx_securitylog_deleted_at ON public."SecurityLog" USING btree (deleted_at);
-- idx_session_deleted_at
CREATE INDEX idx_session_deleted_at ON public."Session" USING btree (deleted_at);
-- idx_session_refresh_token_active
CREATE INDEX idx_session_refresh_token_active ON public."Session" USING btree ("refreshToken") WHERE ("isActive" = true);
-- idx_session_user_active_expires
CREATE INDEX idx_session_user_active_expires ON public."Session" USING btree ("userId", "isActive", "expiresAt");
-- idx_study_session_subject
CREATE INDEX idx_study_session_subject ON public."StudySession" USING btree (subject_id);
-- idx_study_session_user_start_active
CREATE INDEX idx_study_session_user_start_active ON public."StudySession" USING btree (user_id, start_time DESC) WHERE (deleted_at IS NULL);
-- idx_study_session_user_start_safe
CREATE INDEX idx_study_session_user_start_safe ON public."StudySession" USING btree (user_id, start_time DESC) WHERE (deleted_at IS NULL);
-- idx_study_session_user_start_time
CREATE INDEX idx_study_session_user_start_time ON public."StudySession" USING btree (user_id, start_time DESC) WHERE (deleted_at IS NULL);
-- idx_study_sessions_user_start
CREATE INDEX idx_study_sessions_user_start ON public."StudySession" USING btree (user_id, start_time);
-- idx_studysession_deleted_at
CREATE INDEX idx_studysession_deleted_at ON public."StudySession" USING btree (deleted_at);
-- idx_studysession_user_starttime
CREATE INDEX idx_studysession_user_starttime ON public."StudySession" USING btree (user_id, start_time);
-- idx_subject_active_rows
CREATE INDEX idx_subject_active_rows ON public."Subject" USING btree (id) WHERE (deleted_at IS NULL);
-- idx_subject_created_active
CREATE INDEX idx_subject_created_active ON public."Subject" USING btree (created_at DESC, id) WHERE (deleted_at IS NULL);
-- idx_subject_created_active_safe
CREATE INDEX idx_subject_created_active_safe ON public."Subject" USING btree (created_at DESC, id) WHERE (deleted_at IS NULL);
-- idx_subject_deleted_at
CREATE INDEX idx_subject_deleted_at ON public."Subject" USING btree (deleted_at);
-- idx_subject_enrollment_user_subject
CREATE INDEX idx_subject_enrollment_user_subject ON public."SubjectEnrollment" USING btree (user_id, subject_id) WHERE (deleted_at IS NULL);
-- idx_subject_public_catalog_active
CREATE INDEX idx_subject_public_catalog_active ON public."Subject" USING btree (is_published, is_active, level, category_id, created_at DESC) WHERE (deleted_at IS NULL);
-- idx_subject_public_catalog_safe
CREATE INDEX idx_subject_public_catalog_safe ON public."Subject" USING btree (is_published, is_active, level, category_id, created_at DESC) WHERE (deleted_at IS NULL);
-- idx_subject_public_catalog_snake
CREATE INDEX idx_subject_public_catalog_snake ON public."Subject" USING btree (is_published, is_active, level, category_id, created_at DESC) WHERE (deleted_at IS NULL);
-- idx_subtopic_deleted_at
CREATE INDEX idx_subtopic_deleted_at ON public."SubTopic" USING btree (deleted_at);
-- idx_subtopic_topic_order_snake
CREATE INDEX idx_subtopic_topic_order_snake ON public."SubTopic" USING btree (topic_id, "order") WHERE (deleted_at IS NULL);
-- idx_subtopic_type_deleted
CREATE INDEX idx_subtopic_type_deleted ON public."SubTopic" USING btree (type) WHERE (deleted_at IS NULL);
-- idx_system_setting_key
CREATE INDEX idx_system_setting_key ON public."SystemSetting" USING btree (key);
-- idx_system_setting_key_deleted
CREATE INDEX idx_system_setting_key_deleted ON public."SystemSetting" USING btree (key) WHERE (deleted_at IS NULL);
-- idx_systemsetting_deleted_at
CREATE INDEX idx_systemsetting_deleted_at ON public."SystemSetting" USING btree (deleted_at);
-- idx_task_deleted_at
CREATE INDEX idx_task_deleted_at ON public."Task" USING btree (deleted_at);
-- idx_task_user_status_active_created
CREATE INDEX idx_task_user_status_active_created ON public."Task" USING btree (user_id, status, created_at DESC) WHERE (deleted_at IS NULL);
-- idx_task_user_status_created_safe
CREATE INDEX idx_task_user_status_created_safe ON public."Task" USING btree (user_id, status, created_at DESC) WHERE (deleted_at IS NULL);
-- idx_tasks_user_status
CREATE INDEX idx_tasks_user_status ON public."Task" USING btree (user_id, status);
-- idx_topic_deleted_at
CREATE INDEX idx_topic_deleted_at ON public."Topic" USING btree (deleted_at);
-- idx_topic_subject_order_snake
CREATE INDEX idx_topic_subject_order_snake ON public."Topic" USING btree (subject_id, "order") WHERE (deleted_at IS NULL);
-- idx_topicprogress_deleted_at
CREATE INDEX idx_topicprogress_deleted_at ON public."TopicProgress" USING btree (deleted_at);
-- idx_topicprogress_user_active
CREATE INDEX idx_topicprogress_user_active ON public."TopicProgress" USING btree (user_id) WHERE (deleted_at IS NULL);
-- idx_two_factor_settings_user_id
CREATE INDEX idx_two_factor_settings_user_id ON public.two_factor_settings USING btree (user_id) WHERE (deleted_at IS NULL);
-- idx_two_factor_user
CREATE INDEX idx_two_factor_user ON public.two_factor_secrets USING btree (user_id);
-- idx_user_achievement_user_deleted
CREATE INDEX idx_user_achievement_user_deleted ON public."UserAchievement" USING btree (user_id) WHERE (deleted_at IS NULL);
-- idx_user_achievement_user_id
CREATE INDEX idx_user_achievement_user_id ON public."UserAchievement" USING btree (user_id);
-- idx_user_active_email
CREATE INDEX idx_user_active_email ON public."User" USING btree (email) WHERE (deleted_at IS NULL);
-- idx_user_created_at_desc_deleted
CREATE INDEX idx_user_created_at_desc_deleted ON public."User" USING btree (created_at DESC) WHERE (deleted_at IS NULL);
-- idx_user_credential_user
CREATE INDEX idx_user_credential_user ON public."UserCredential" USING btree (user_id) WHERE (deleted_at IS NULL);
-- idx_user_email_active
CREATE INDEX idx_user_email_active ON public."User" USING btree (email) WHERE (deleted_at IS NULL);
-- idx_user_lesson
CREATE UNIQUE INDEX idx_user_lesson ON public."TopicProgress" USING btree (user_id, sub_topic_id);
-- idx_user_level
CREATE INDEX idx_user_level ON public."User" USING btree (level);
-- idx_user_settings_user_id
CREATE UNIQUE INDEX idx_user_settings_user_id ON public."UserSettings" USING btree (user_id);
-- idx_user_settings_user_id_active
CREATE INDEX idx_user_settings_user_id_active ON public."UserSettings" USING btree (user_id) WHERE (deleted_at IS NULL);
-- idx_user_status_deleted
CREATE INDEX idx_user_status_deleted ON public."User" USING btree (status) WHERE (deleted_at IS NULL);
-- idx_userachievement_deleted_at
CREATE INDEX idx_userachievement_deleted_at ON public."UserAchievement" USING btree (deleted_at);
-- idx_usersettings_deleted_at
CREATE INDEX idx_usersettings_deleted_at ON public."UserSettings" USING btree (deleted_at);
-- subject_name_ar_trgm_idx
CREATE INDEX subject_name_ar_trgm_idx ON public."Subject" USING gin (name_ar gin_trgm_ops);
-- subject_name_trgm_idx
CREATE INDEX subject_name_trgm_idx ON public."Subject" USING gin (name gin_trgm_ops);
