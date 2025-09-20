-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "entity" (
	"entityid" serial PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"type" varchar(32),
	"domain" varchar(128),
	"description" text
);
--> statement-breakpoint
CREATE TABLE "competitor" (
	"competitorid" serial PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"domain" varchar(128),
	"industry" varchar(64),
	"description" text,
	"createdat" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "metricvalue" (
	"valueid" serial PRIMARY KEY NOT NULL,
	"metricid" integer,
	"entityid" integer,
	"reportid" integer,
	"periodtype" varchar(32),
	"periodvalue" varchar(32),
	"value" numeric,
	"additionalinfo" text,
	"createdat" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "socialprofile" (
	"profileid" serial PRIMARY KEY NOT NULL,
	"entityid" integer,
	"platform" varchar(64),
	"url" text,
	"followers" integer,
	"lastupdated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "review" (
	"reviewid" serial PRIMARY KEY NOT NULL,
	"entityid" integer,
	"reportid" integer,
	"ispositive" boolean,
	"reviewsource" varchar(128),
	"content" text,
	"mentionedproduct" varchar(64),
	"rating" integer,
	"reviewdate" date,
	"createdat" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "insight" (
	"insightid" serial PRIMARY KEY NOT NULL,
	"reportsectionid" integer,
	"title" varchar(128),
	"type" varchar(64),
	"content" text,
	"position" integer,
	"priority" varchar(32),
	"createdat" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "adcreative" (
	"adid" serial PRIMARY KEY NOT NULL,
	"entityid" integer,
	"reportid" integer,
	"format" varchar(64),
	"campaign" varchar(128),
	"creativeurl" text,
	"performancenotes" text,
	"adplatform" varchar(64),
	"createdat" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reportmedia" (
	"mediaid" serial PRIMARY KEY NOT NULL,
	"reportid" integer,
	"sectionid" integer,
	"type" varchar(64),
	"url" text,
	"caption" text,
	"filesize" integer,
	"createdat" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vertical" (
	"verticalid" serial PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "User" (
	"userid" serial PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"email" varchar(128) NOT NULL,
	"role" varchar(32) NOT NULL,
	"status" varchar(32),
	"createdat" timestamp DEFAULT now(),
	CONSTRAINT "User_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "client" (
	"clientid" serial PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"industry" varchar(128),
	"maincontact" varchar(128),
	"status" varchar(32),
	"createdat" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "report" (
	"reportid" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"summary" text,
	"createdat" timestamp DEFAULT now(),
	"updatedat" timestamp DEFAULT now(),
	"clientid" integer,
	"verticalid" integer,
	"createdbyuserid" integer,
	"filelink" text,
	"status" varchar(32)
);
--> statement-breakpoint
CREATE TABLE "reportsection" (
	"sectionid" serial PRIMARY KEY NOT NULL,
	"reportid" integer,
	"sectionname" varchar(128) NOT NULL,
	"position" integer,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "sectionitem" (
	"itemid" serial PRIMARY KEY NOT NULL,
	"sectionid" integer,
	"itemtitle" varchar(128) NOT NULL,
	"content" text,
	"position" integer,
	"type" varchar(64),
	"createdat" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tag" (
	"tagid" serial PRIMARY KEY NOT NULL,
	"name" varchar(64) NOT NULL,
	"category" varchar(32),
	"description" text,
	CONSTRAINT "tag_name_key" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "metric" (
	"metricid" serial PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"unit" varchar(32),
	"description" text,
	"category" varchar(64)
);
--> statement-breakpoint
CREATE TABLE "reporttag" (
	"reportid" integer NOT NULL,
	"tagid" integer NOT NULL,
	CONSTRAINT "reporttag_pkey" PRIMARY KEY("reportid","tagid")
);
--> statement-breakpoint
ALTER TABLE "metricvalue" ADD CONSTRAINT "metricvalue_metricid_fkey" FOREIGN KEY ("metricid") REFERENCES "public"."metric"("metricid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metricvalue" ADD CONSTRAINT "metricvalue_entityid_fkey" FOREIGN KEY ("entityid") REFERENCES "public"."entity"("entityid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metricvalue" ADD CONSTRAINT "metricvalue_reportid_fkey" FOREIGN KEY ("reportid") REFERENCES "public"."report"("reportid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "socialprofile" ADD CONSTRAINT "socialprofile_entityid_fkey" FOREIGN KEY ("entityid") REFERENCES "public"."entity"("entityid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_entityid_fkey" FOREIGN KEY ("entityid") REFERENCES "public"."entity"("entityid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_reportid_fkey" FOREIGN KEY ("reportid") REFERENCES "public"."report"("reportid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insight" ADD CONSTRAINT "insight_reportsectionid_fkey" FOREIGN KEY ("reportsectionid") REFERENCES "public"."reportsection"("sectionid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adcreative" ADD CONSTRAINT "adcreative_entityid_fkey" FOREIGN KEY ("entityid") REFERENCES "public"."entity"("entityid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adcreative" ADD CONSTRAINT "adcreative_reportid_fkey" FOREIGN KEY ("reportid") REFERENCES "public"."report"("reportid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reportmedia" ADD CONSTRAINT "reportmedia_reportid_fkey" FOREIGN KEY ("reportid") REFERENCES "public"."report"("reportid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reportmedia" ADD CONSTRAINT "reportmedia_sectionid_fkey" FOREIGN KEY ("sectionid") REFERENCES "public"."reportsection"("sectionid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_clientid_fkey" FOREIGN KEY ("clientid") REFERENCES "public"."client"("clientid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_verticalid_fkey" FOREIGN KEY ("verticalid") REFERENCES "public"."vertical"("verticalid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_createdbyuserid_fkey" FOREIGN KEY ("createdbyuserid") REFERENCES "public"."User"("userid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reportsection" ADD CONSTRAINT "reportsection_reportid_fkey" FOREIGN KEY ("reportid") REFERENCES "public"."report"("reportid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sectionitem" ADD CONSTRAINT "sectionitem_sectionid_fkey" FOREIGN KEY ("sectionid") REFERENCES "public"."reportsection"("sectionid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reporttag" ADD CONSTRAINT "reporttag_reportid_fkey" FOREIGN KEY ("reportid") REFERENCES "public"."report"("reportid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reporttag" ADD CONSTRAINT "reporttag_tagid_fkey" FOREIGN KEY ("tagid") REFERENCES "public"."tag"("tagid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_metric_value_entity" ON "metricvalue" USING btree ("entityid" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_metric_value_report" ON "metricvalue" USING btree ("reportid" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_report_client" ON "report" USING btree ("clientid" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_report_created_at" ON "report" USING btree ("createdat" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_report_vertical" ON "report" USING btree ("verticalid" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_section_report" ON "reportsection" USING btree ("reportid" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_item_section" ON "sectionitem" USING btree ("sectionid" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_tag_category" ON "tag" USING btree ("category" text_ops);
*/