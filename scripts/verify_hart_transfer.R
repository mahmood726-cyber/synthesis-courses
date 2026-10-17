# Hart 1999 historical warfarin stroke incidence-rate example.
# Classroom source integrity and numerical-oracle checks only; not clinical advice.
stopifnot(requireNamespace("metadat", quietly=TRUE),
          requireNamespace("metafor", quietly=TRUE))
d <- metadat::dat.hart1999
stopifnot(nrow(d)==6L,
          identical(as.character(d$study),c("AFASAK","SPAF","BAATAF","CAFA","SPINAF","EAFT")),
          isTRUE(all.equal(as.numeric(d$x1i),c(9,8,3,6,7,20))),
          isTRUE(all.equal(as.numeric(d$t1i),c(413,263,487,237,489,507))),
          isTRUE(all.equal(as.numeric(d$x2i),c(19,19,13,9,23,50))),
          isTRUE(all.equal(as.numeric(d$t2i),c(398,245,435,241,483,405))))
es <- metafor::escalc(measure="IRR", x1i=x1i,x2i=x2i,t1i=t1i,t2i=t2i,data=d)
fit <- metafor::rma(yi,vi,data=es,method="REML")
stopifnot(abs(as.numeric(fit$b)+1.0168)<0.00015,
          abs(as.numeric(fit$se)-0.1635)<0.00015,
          abs(as.numeric(fit$tau2))<1e-8,
          abs(as.numeric(fit$QE)-2.9625)<0.00015)
pred <- predict(fit,transf=exp)
stopifnot(abs(as.numeric(pred$pred)-0.3617)<0.00015,
          abs(as.numeric(pred$ci.lb)-0.2626)<0.00015,
          abs(as.numeric(pred$ci.ub)-0.4984)<0.00015)
ird <- metafor::rma(measure="IRD", x1i=x1i,x2i=x2i,t1i=t1i,t2i=t2i,data=d,method="REML")
stopifnot(abs(as.numeric(ird$I2)-50.75)<0.15)
cat("PASS: Hart 1999 six authentic records, log IRR, REML and IRD heterogeneity verified.\n")
