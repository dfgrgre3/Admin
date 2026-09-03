-- RECREATE: BiometricCredential_credentialId_idx
CREATE INDEX "BiometricCredential_credentialId_idx" ON public."BiometricCredential" USING btree ("credentialId");
-- RECREATE: Book_subjectId_idx
CREATE INDEX "Book_subjectId_idx" ON public."Book" USING btree ("subjectId");
-- RECREATE: Challenge_subjectId_idx
CREATE INDEX "Challenge_subjectId_idx" ON public."Challenge" USING btree (subject_id);
-- RECREATE: Coupon_code_idx
CREATE INDEX "Coupon_code_idx" ON public."Coupon" USING btree (code);
-- RECREATE: Coupon_code_key
CREATE UNIQUE INDEX "Coupon_code_key" ON public."Coupon" USING btree (code);
-- RECREATE: Exam_subjectId_idx
CREATE INDEX "Exam_subjectId_idx" ON public."Exam" USING btree (subject_id);
-- RECREATE: Invoice_invoiceNumber_key
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON public."Invoice" USING btree (invoice_number);
-- RECREATE: Invoice_paymentId_key
CREATE UNIQUE INDEX "Invoice_paymentId_key" ON public."Invoice" USING btree (payment_id);
-- RECREATE: Notification_createdAt_idx
CREATE INDEX "Notification_createdAt_idx" ON public."Notification" USING btree (created_at DESC);
-- RECREATE: Payment_status_idx
CREATE INDEX "Payment_status_idx" ON public."Payment" USING btree (status);
-- RECREATE: Payment_userId_createdAt_idx
CREATE INDEX "Payment_userId_createdAt_idx" ON public."Payment" USING btree (user_id, created_at DESC);
-- RECREATE: Schedule_userId_idx
CREATE INDEX "Schedule_userId_idx" ON public."Schedule" USING btree (user_id);
-- RECREATE: SeasonParticipation_userId_seasonId_idx
CREATE INDEX "SeasonParticipation_userId_seasonId_idx" ON public."SeasonParticipation" USING btree ("userId", "seasonId");
-- RECREATE: Session_userId_isActive_expiresAt_idx
CREATE INDEX "Session_userId_isActive_expiresAt_idx" ON public."Session" USING btree ("userId", "isActive", "expiresAt" DESC);
-- RECREATE: SubjectEnrollment_active_enrollment_idx
CREATE UNIQUE INDEX "SubjectEnrollment_active_enrollment_idx" ON public."SubjectEnrollment" USING btree (user_id, subject_id) WHERE ("isDeleted" = false);
-- RECREATE: Subject_slug_key
CREATE UNIQUE INDEX "Subject_slug_key" ON public."Subject" USING btree (slug);
-- RECREATE: Task_dueAt_idx
CREATE INDEX "Task_dueAt_idx" ON public."Task" USING btree (due_at);
-- RECREATE: Teacher_userId_idx
CREATE INDEX "Teacher_userId_idx" ON public."Teacher" USING btree ("userId");
-- RECREATE: TopicProgress_userId_subTopicId_key
CREATE UNIQUE INDEX "TopicProgress_userId_subTopicId_key" ON public."TopicProgress" USING btree (user_id, sub_topic_id);
-- RECREATE: Topic_subjectId_idx
CREATE INDEX "Topic_subjectId_idx" ON public."Topic" USING btree (subject_id);
-- RECREATE: idx_Achievement_deleted_at
CREATE INDEX "idx_Achievement_deleted_at" ON public."Achievement" USING btree (deleted_at);
-- RECREATE: idx_Achievement_key
CREATE UNIQUE INDEX "idx_Achievement_key" ON public."Achievement" USING btree (key);
-- RECREATE: idx_BlogPost_deleted_at
CREATE INDEX "idx_BlogPost_deleted_at" ON public."BlogPost" USING btree (deleted_at);
-- RECREATE: idx_BlogPost_slug
CREATE UNIQUE INDEX "idx_BlogPost_slug" ON public."BlogPost" USING btree (slug);
-- RECREATE: idx_Category_deleted_at
CREATE INDEX "idx_Category_deleted_at" ON public."Category" USING btree (deleted_at);
-- RECREATE: idx_Category_slug
CREATE UNIQUE INDEX "idx_Category_slug" ON public."Category" USING btree (slug);
-- RECREATE: idx_Invoice_user_id
CREATE INDEX "idx_Invoice_user_id" ON public."Invoice" USING btree (user_id);
-- RECREATE: idx_LessonAttachment_sub_topic_id
CREATE INDEX "idx_LessonAttachment_sub_topic_id" ON public."LessonAttachment" USING btree ("subTopicId");
-- RECREATE: idx_Payment_external_txn_id
CREATE INDEX "idx_Payment_external_txn_id" ON public."Payment" USING btree (external_txn_id);
-- RECREATE: idx_Payment_paymob_order_id
CREATE INDEX "idx_Payment_paymob_order_id" ON public."Payment" USING btree (paymob_order_id);
-- RECREATE: idx_Payment_plan_id
CREATE INDEX "idx_Payment_plan_id" ON public."Payment" USING btree (plan_id);
-- RECREATE: idx_Payment_reference
CREATE UNIQUE INDEX "idx_Payment_reference" ON public."Payment" USING btree (reference);
-- RECREATE: idx_Payment_user_id
CREATE INDEX "idx_Payment_user_id" ON public."Payment" USING btree (user_id);
-- RECREATE: idx_Question_exam_id
CREATE INDEX "idx_Question_exam_id" ON public."Question" USING btree (exam_id);
-- RECREATE: idx_Reward_deleted_at
CREATE INDEX "idx_Reward_deleted_at" ON public."Reward" USING btree (deleted_at);
-- RECREATE: idx_Schedule_user_id
CREATE INDEX "idx_Schedule_user_id" ON public."Schedule" USING btree (user_id);
-- RECREATE: idx_Session_deleted_at
CREATE INDEX "idx_Session_deleted_at" ON public."Session" USING btree (deleted_at);
-- RECREATE: idx_Session_user_id
CREATE INDEX "idx_Session_user_id" ON public."Session" USING btree ("userId");
-- RECREATE: idx_StudySession_subject_id
CREATE INDEX "idx_StudySession_subject_id" ON public."StudySession" USING btree (subject_id);
-- RECREATE: idx_SubTopic_deleted_at
CREATE INDEX "idx_SubTopic_deleted_at" ON public."SubTopic" USING btree (deleted_at);
-- RECREATE: idx_SubTopic_topic_id
CREATE INDEX "idx_SubTopic_topic_id" ON public."SubTopic" USING btree (topic_id);
-- RECREATE: idx_Subject_deleted_at
CREATE INDEX "idx_Subject_deleted_at" ON public."Subject" USING btree (deleted_at);
-- RECREATE: idx_Task_deleted_at
CREATE INDEX "idx_Task_deleted_at" ON public."Task" USING btree (deleted_at);
-- RECREATE: idx_TopicProgress_deleted_at
CREATE INDEX "idx_TopicProgress_deleted_at" ON public."TopicProgress" USING btree (deleted_at);
-- RECREATE: idx_UserAchievement_deleted_at
CREATE INDEX "idx_UserAchievement_deleted_at" ON public."UserAchievement" USING btree (deleted_at);
-- RECREATE: idx_UserAchievement_user_id
CREATE INDEX "idx_UserAchievement_user_id" ON public."UserAchievement" USING btree (user_id);
-- RECREATE: idx_UserSettings_user_id
CREATE UNIQUE INDEX "idx_UserSettings_user_id" ON public."UserSettings" USING btree (user_id);
-- RECREATE: idx_User_level
CREATE INDEX "idx_User_level" ON public."User" USING btree (level);
-- RECREATE: idx_blocked_tokens_jti
CREATE INDEX idx_blocked_tokens_jti ON public.blocked_tokens USING btree (jti);
-- RECREATE: idx_challenge_deleted_at
CREATE INDEX idx_challenge_deleted_at ON public."Challenge" USING btree (deleted_at);
-- RECREATE: idx_course_changelogs_version
CREATE INDEX idx_course_changelogs_version ON public.course_changelogs USING btree (subject_id, version DESC);
-- RECREATE: idx_course_pricing_subject_id
CREATE INDEX idx_course_pricing_subject_id ON public.course_pricing USING btree (subject_id);
-- RECREATE: idx_course_versions_latest
CREATE INDEX idx_course_versions_latest ON public.course_versions USING btree (subject_id, version_number DESC);
-- RECREATE: idx_coursereview_deleted_at
CREATE INDEX idx_coursereview_deleted_at ON public."CourseReview" USING btree (deleted_at);
-- RECREATE: idx_enrollment_user_deleted
CREATE INDEX idx_enrollment_user_deleted ON public."SubjectEnrollment" USING btree (user_id) WHERE (deleted_at IS NULL);
-- RECREATE: idx_exam_deleted_at
CREATE INDEX idx_exam_deleted_at ON public."Exam" USING btree (deleted_at);
-- RECREATE: idx_exam_result_user_taken
CREATE INDEX idx_exam_result_user_taken ON ONLY public."ExamResult" USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- RECREATE: idx_exam_result_user_taken_active
CREATE INDEX idx_exam_result_user_taken_active ON ONLY public."ExamResult" USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- RECREATE: idx_exam_result_user_taken_safe
CREATE INDEX idx_exam_result_user_taken_safe ON ONLY public."ExamResult" USING btree (user_id, taken_at DESC) WHERE (deleted_at IS NULL);
-- RECREATE: idx_forum_category_order_active
CREATE INDEX idx_forum_category_order_active ON public."ForumCategory" USING btree ("order", created_at DESC) WHERE (deleted_at IS NULL);
-- RECREATE: idx_forum_topic_category_created_active
CREATE INDEX idx_forum_topic_category_created_active ON public."ForumTopic" USING btree (category_id, created_at DESC) WHERE (deleted_at IS NULL);
-- RECREATE: idx_http_metric_buckets_unique_bucket
CREATE UNIQUE INDEX idx_http_metric_buckets_unique_bucket ON public.http_metric_buckets USING btree (bucket_start, route, method, status);
-- RECREATE: idx_lesson_drip_sub_topic
CREATE INDEX idx_lesson_drip_sub_topic ON public.lesson_drip_schedules USING btree (sub_topic_id);
-- RECREATE: idx_lms_course_created_at_deleted
CREATE INDEX idx_lms_course_created_at_deleted ON public."LmsCourse" USING btree (created_at DESC) WHERE (deleted_at IS NULL);
-- RECREATE: idx_lms_course_status_deleted
CREATE INDEX idx_lms_course_status_deleted ON public."LmsCourse" USING btree (status) WHERE (deleted_at IS NULL);
-- RECREATE: idx_notification_is_read
CREATE INDEX idx_notification_is_read ON public."Notification" USING btree (is_read);
-- RECREATE: idx_notification_user_created_active
CREATE INDEX idx_notification_user_created_active ON public."Notification" USING btree (user_id, created_at DESC) WHERE (deleted_at IS NULL);
-- RECREATE: idx_notification_user_created_covering_active
CREATE INDEX idx_notification_user_created_covering_active ON public."Notification" USING btree (user_id, created_at DESC) INCLUDE (id, title, message, type, is_read, link, icon) WHERE (deleted_at IS NULL);
-- RECREATE: idx_notification_user_created_deleted
CREATE INDEX idx_notification_user_created_deleted ON public."Notification" USING btree (user_id, created_at DESC) WHERE (deleted_at IS NULL);
-- RECREATE: idx_notification_user_created_read_safe
CREATE INDEX idx_notification_user_created_read_safe ON public."Notification" USING btree (user_id, created_at DESC) INCLUDE (id, type, title, message, is_read) WHERE (deleted_at IS NULL);
-- RECREATE: idx_notification_user_unread
CREATE INDEX idx_notification_user_unread ON public."Notification" USING btree (user_id) WHERE (is_read = false);
-- RECREATE: idx_notification_user_unread_active
CREATE INDEX idx_notification_user_unread_active ON public."Notification" USING btree (user_id, created_at DESC) WHERE ((deleted_at IS NULL) AND (is_read = false));
-- RECREATE: idx_notification_user_unread_safe
CREATE INDEX idx_notification_user_unread_safe ON public."Notification" USING btree (user_id, created_at DESC) WHERE ((deleted_at IS NULL) AND (is_read = false));
-- RECREATE: idx_notifications_user_created
CREATE INDEX idx_notifications_user_created ON public."Notification" USING btree (user_id, created_at);
-- RECREATE: idx_notifications_user_id_status_delivered_sent
CREATE INDEX idx_notifications_user_id_status_delivered_sent ON public."Notification" USING btree (user_id, created_at DESC) WHERE (status = ANY (ARRAY['delivered'::text, 'sent'::text]));
-- RECREATE: idx_notifications_user_id_unread_partial
CREATE INDEX idx_notifications_user_id_unread_partial ON public."Notification" USING btree (user_id, created_at DESC) WHERE (is_read = false);
-- RECREATE: idx_payment_active_user_created
CREATE INDEX idx_payment_active_user_created ON public."Payment" USING btree (user_id, created_at DESC) WHERE (deleted_at IS NULL);
-- RECREATE: idx_payment_created_at_deleted
CREATE INDEX idx_payment_created_at_deleted ON public."Payment" USING btree (created_at DESC) WHERE (deleted_at IS NULL);
-- RECREATE: idx_payment_created_deleted
CREATE INDEX idx_payment_created_deleted ON public."Payment" USING btree (created_at DESC) WHERE (deleted_at IS NULL);
-- RECREATE: idx_payment_deleted_at
CREATE INDEX idx_payment_deleted_at ON public."Payment" USING btree (deleted_at);
-- RECREATE: idx_payment_failed_user
CREATE INDEX idx_payment_failed_user ON public."Payment" USING btree (user_id, created_at) WHERE (status = 'failed'::text);
-- RECREATE: idx_payment_pending_user
CREATE INDEX idx_payment_pending_user ON public."Payment" USING btree (user_id, created_at) WHERE (status = 'pending'::text);
-- RECREATE: idx_payment_subject
CREATE INDEX idx_payment_subject ON public."Payment" USING btree (subject_id);
-- RECREATE: idx_payment_user_created_covering
CREATE INDEX idx_payment_user_created_covering ON public."Payment" USING btree (user_id, created_at DESC) INCLUDE (amount, status) WHERE (deleted_at IS NULL);
-- RECREATE: idx_payment_user_status_active_safe
CREATE INDEX idx_payment_user_status_active_safe ON public."Payment" USING btree (user_id, status, created_at DESC) WHERE (deleted_at IS NULL);
-- RECREATE: idx_payment_user_status_created
CREATE INDEX idx_payment_user_status_created ON public."Payment" USING btree (user_id, status, created_at DESC) WHERE (deleted_at IS NULL);
-- RECREATE: idx_perf_notifications_user_created
CREATE INDEX idx_perf_notifications_user_created ON public."Notification" USING btree (user_id, created_at DESC);
-- RECREATE: idx_question_deleted_at
CREATE INDEX idx_question_deleted_at ON public."Question" USING btree (deleted_at);
-- RECREATE: idx_season_deleted_at
CREATE INDEX idx_season_deleted_at ON public."Season" USING btree (deleted_at);
-- RECREATE: idx_security_log_event_type_created
CREATE INDEX idx_security_log_event_type_created ON public."SecurityLog" USING btree (event_type, created_at DESC) WHERE (deleted_at IS NULL);
-- RECREATE: idx_securitylog_deleted_at
CREATE INDEX idx_securitylog_deleted_at ON public."SecurityLog" USING btree (deleted_at);
-- RECREATE: idx_session_refresh_token_active
CREATE INDEX idx_session_refresh_token_active ON public."Session" USING btree ("refreshToken") WHERE ("isActive" = true);
-- RECREATE: idx_study_session_user_start_active
CREATE INDEX idx_study_session_user_start_active ON public."StudySession" USING btree (user_id, start_time DESC) WHERE (deleted_at IS NULL);
-- RECREATE: idx_study_session_user_start_desc
CREATE INDEX idx_study_session_user_start_desc ON public."StudySession" USING btree (user_id, start_time DESC);
-- RECREATE: idx_study_session_user_start_safe
CREATE INDEX idx_study_session_user_start_safe ON public."StudySession" USING btree (user_id, start_time DESC) WHERE (deleted_at IS NULL);
-- RECREATE: idx_study_session_user_start_time
CREATE INDEX idx_study_session_user_start_time ON public."StudySession" USING btree (user_id, start_time DESC) WHERE (deleted_at IS NULL);
-- RECREATE: idx_studysession_deleted_at
CREATE INDEX idx_studysession_deleted_at ON public."StudySession" USING btree (deleted_at);
-- RECREATE: idx_studysession_user_starttime
CREATE INDEX idx_studysession_user_starttime ON public."StudySession" USING btree (user_id, start_time);
-- RECREATE: idx_subject_active_rows
CREATE INDEX idx_subject_active_rows ON public."Subject" USING btree (id) WHERE (deleted_at IS NULL);
-- RECREATE: idx_subject_created_active
CREATE INDEX idx_subject_created_active ON public."Subject" USING btree (created_at DESC, id) WHERE (deleted_at IS NULL);
-- RECREATE: idx_subject_created_active_safe
CREATE INDEX idx_subject_created_active_safe ON public."Subject" USING btree (created_at DESC, id) WHERE (deleted_at IS NULL);
-- RECREATE: idx_subject_enrollment_user_subject
CREATE INDEX idx_subject_enrollment_user_subject ON public."SubjectEnrollment" USING btree (user_id, subject_id) WHERE (deleted_at IS NULL);
-- RECREATE: idx_subject_name_ar_trgm
CREATE INDEX idx_subject_name_ar_trgm ON public."Subject" USING gin (name_ar gin_trgm_ops);
-- RECREATE: idx_subject_name_trgm
CREATE INDEX idx_subject_name_trgm ON public."Subject" USING gin (name gin_trgm_ops);
-- RECREATE: idx_subject_public_catalog_active
CREATE INDEX idx_subject_public_catalog_active ON public."Subject" USING btree (is_published, is_active, level, category_id, created_at DESC) WHERE (deleted_at IS NULL);
-- RECREATE: idx_subject_public_catalog_safe
CREATE INDEX idx_subject_public_catalog_safe ON public."Subject" USING btree (is_published, is_active, level, category_id, created_at DESC) WHERE (deleted_at IS NULL);
-- RECREATE: idx_subject_public_catalog_snake
CREATE INDEX idx_subject_public_catalog_snake ON public."Subject" USING btree (is_published, is_active, level, category_id, created_at DESC) WHERE (deleted_at IS NULL);
-- RECREATE: idx_subtopic_topic_order_snake
CREATE INDEX idx_subtopic_topic_order_snake ON public."SubTopic" USING btree (topic_id, "order") WHERE (deleted_at IS NULL);
-- RECREATE: idx_subtopic_type_deleted
CREATE INDEX idx_subtopic_type_deleted ON public."SubTopic" USING btree (type) WHERE (deleted_at IS NULL);
-- RECREATE: idx_system_setting_deleted_at
CREATE INDEX idx_system_setting_deleted_at ON public."SystemSetting" USING btree (deleted_at);
-- RECREATE: idx_system_setting_key
CREATE INDEX idx_system_setting_key ON public."SystemSetting" USING btree (key);
-- RECREATE: idx_system_setting_key_deleted
CREATE INDEX idx_system_setting_key_deleted ON public."SystemSetting" USING btree (key) WHERE (deleted_at IS NULL);
-- RECREATE: idx_task_user_status_active_created
CREATE INDEX idx_task_user_status_active_created ON public."Task" USING btree (user_id, status, created_at DESC) WHERE (deleted_at IS NULL);
-- RECREATE: idx_task_user_status_created_safe
CREATE INDEX idx_task_user_status_created_safe ON public."Task" USING btree (user_id, status, created_at DESC) WHERE (deleted_at IS NULL);
-- RECREATE: idx_tasks_user_status
CREATE INDEX idx_tasks_user_status ON public."Task" USING btree (user_id, status);
-- RECREATE: idx_topic_deleted_at
CREATE INDEX idx_topic_deleted_at ON public."Topic" USING btree (deleted_at);
-- RECREATE: idx_topic_subject_order_snake
CREATE INDEX idx_topic_subject_order_snake ON public."Topic" USING btree (subject_id, "order") WHERE (deleted_at IS NULL);
-- RECREATE: idx_topicprogress_user_active
CREATE INDEX idx_topicprogress_user_active ON public."TopicProgress" USING btree (user_id) WHERE (deleted_at IS NULL);
-- RECREATE: idx_two_factor_settings_user_id
CREATE INDEX idx_two_factor_settings_user_id ON public.two_factor_settings USING btree (user_id) WHERE (deleted_at IS NULL);
-- RECREATE: idx_two_factor_user
CREATE INDEX idx_two_factor_user ON public.two_factor_secrets USING btree (user_id);
-- RECREATE: idx_user_achievement_user_deleted
CREATE INDEX idx_user_achievement_user_deleted ON public."UserAchievement" USING btree (user_id) WHERE (deleted_at IS NULL);
-- RECREATE: idx_user_achievement_user_id
CREATE INDEX idx_user_achievement_user_id ON public."UserAchievement" USING btree (user_id);
-- RECREATE: idx_user_active_email
CREATE INDEX idx_user_active_email ON public."User" USING btree (email) WHERE (deleted_at IS NULL);
-- RECREATE: idx_user_created_at_desc_deleted
CREATE INDEX idx_user_created_at_desc_deleted ON public."User" USING btree (created_at DESC) WHERE (deleted_at IS NULL);
-- RECREATE: idx_user_credential_user
CREATE INDEX idx_user_credential_user ON public."UserCredential" USING btree (user_id) WHERE (deleted_at IS NULL);
-- RECREATE: idx_user_email_active
CREATE INDEX idx_user_email_active ON public."User" USING btree (email) WHERE (deleted_at IS NULL);
-- RECREATE: idx_user_lesson
CREATE UNIQUE INDEX idx_user_lesson ON public."TopicProgress" USING btree (user_id, sub_topic_id);
-- RECREATE: idx_user_settings_user_id
CREATE UNIQUE INDEX idx_user_settings_user_id ON public."UserSettings" USING btree (user_id);
-- RECREATE: idx_user_settings_user_id_active
CREATE INDEX idx_user_settings_user_id_active ON public."UserSettings" USING btree (user_id) WHERE (deleted_at IS NULL);
-- RECREATE: idx_user_status_deleted
CREATE INDEX idx_user_status_deleted ON public."User" USING btree (status) WHERE (deleted_at IS NULL);
-- RECREATE: idx_usersettings_deleted_at
CREATE INDEX idx_usersettings_deleted_at ON public."UserSettings" USING btree (deleted_at);
