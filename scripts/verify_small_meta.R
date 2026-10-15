# Verifies package data and teaching arithmetic against published R objects.
# Usage: Rscript scripts/verify_small_meta.R
# Requires metafor and metadat; intentionally does not install packages silently.
if (!requireNamespace("metadat", quietly=TRUE) || !requireNamespace("metafor", quietly=TRUE)) {
  stop("Install the CRAN packages 'metadat' and 'metafor' before running this optional validation.")
}
library(metadat)
library(metafor)

hine <- metadat::dat.hine1989
stopifnot(nrow(hine)==6L,
          identical(as.integer(hine$ai), c(2L,4L,6L,7L,7L,11L)),
          identical(as.integer(hine$ci), c(1L,4L,4L,5L,3L,4L)),
          identical(as.integer(hine$n1i), c(39L,44L,107L,103L,110L,154L)),
          identical(as.integer(hine$n2i), c(43L,44L,110L,100L,106L,146L)))
h <- metafor::escalc(measure="RD",ai=ai, n1i=n1i, ci=ci,n2i=n2i,data=hine)
r <- metafor::rma(yi,vi,data=h,method="REML")
stopifnot(abs(as.numeric(r$b)-0.029444320344763953)<1e-7,
          abs(as.numeric(r$se)-0.013068316969818292)<1e-7,
          abs(as.numeric(r$QE)-0.8596926775315366)<1e-6,
          abs(as.numeric(r$tau2))<1e-6)
cat("PASS: 6-trial Hine REML estimate and Q agree with the browser data.\n")

berkey <- metadat::dat.berkey1998
stopifnot(nrow(berkey)==10L, length(unique(berkey$trial))==5L)
pd <- subset(berkey, outcome=="PD")
al <- subset(berkey, outcome=="AL")
stopifnot(nrow(pd)==5L,nrow(al)==5L)
stopifnot(all.equal(as.numeric(pd$yi), c(0.47,0.20,0.40,0.26,0.56))==TRUE,
          all.equal(as.numeric(pd$vi), c(0.0075,0.0057,0.0021,0.0029,0.0148))==TRUE)
pdr <- metafor::rma(yi,vi,data=pd,method="FE")
alr <- metafor::rma(yi,vi,data=al,method="FE")
stopifnot(abs(as.numeric(pdr$b)-0.3472008701943795)<1e-8,
          abs(as.numeric(alr$b)+0.39258387448645665)<1e-8)
cat("PASS: 5-trial Berkey PD/AL marginal common-effect estimates agree with the browser data.\n")
cat("IMPORTANT: These are NOT the multivariate REML estimates.\n")
