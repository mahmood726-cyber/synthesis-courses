# Standalone reproducibility of the six-row archival BCG teaching exercise.
# Requires a locally installed metafor R package. Not a clinical review.
library(metafor)
# metadat holds this archival dataset; metafor supplies the estimators.
d <- subset(metadat::dat.colditz1994, trial %in% c(1, 2, 4, 5, 6, 8))
stopifnot(nrow(d) == 6L,
          identical(as.integer(d$trial), c(1L,2L,4L,5L,6L,8L)),
          identical(as.integer(d$tpos), c(4L,6L,62L,33L,180L,505L)),
          identical(as.integer(d$cpos), c(11L,29L,248L,47L,372L,499L)))
e <- metafor::escalc(measure="RR",ai=tpos,bi=tneg,ci=cpos,di=cneg,data=d)
fixed <- metafor::rma(yi,vi,data=e,method="FE")
random <- metafor::rma(yi,vi,data=e,method="DL")
without <- subset(e,trial != 8)
omitted <- metafor::rma(yi,vi,data=without,method="FE")
near <- function(x,y,tol=1e-6) abs(x-y)<tol
stopifnot(near(exp(as.numeric(coef(fixed))),0.6591100685442882),
          near(exp(as.numeric(coef(random))),0.4616997371118676),
          near(exp(as.numeric(coef(omitted))),0.4052281050689557),
          near(as.numeric(random$QE),127.11259654268221),
          near(as.numeric(random$tau2),0.4203531908875549))
cat("PASS: archival BCG six-row FE/DL, heterogeneity and omit-Madras sensitivity.\n")
cat("This nonrepresentative subset is NOT a vaccine-effectiveness estimate.\n")