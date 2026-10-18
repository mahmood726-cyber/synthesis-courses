# Exact metadat/metafor oracle for the six-record lidocaine classroom investigation.
# These six records are NOT the original review's entire 14-trial population.
# Run with: Rscript scripts/verify_lidocaine_story.R

if (!requireNamespace("metadat", quietly=TRUE) || !requireNamespace("metafor", quietly=TRUE)) {
  stop("Install real CRAN metadat and metafor to run this check.")
}
dat <- metadat::dat.hine1989
stopifnot(nrow(dat) == 6L,
          identical(as.integer(dat$ai), c(2L,4L,6L,7L,7L,11L)),
          identical(as.integer(dat$ci), c(1L,4L,4L,5L,3L,4L)),
          identical(as.integer(dat$n1i), c(39L,44L,107L,103L,110L,154L)),
          identical(as.integer(dat$n2i), c(43L,44L,110L,100L,106L,146L)))

dat <- metafor::escalc(measure="RD", ai=ai, n1i=n1i, ci=ci, n2i=n2i, data=dat)
fit <- metafor::rma(yi, vi, data=dat, method="REML")
fe <- metafor::rma(yi, vi, data=dat, method="FE")

expect <- c(estimate=0.029444320344763953,
            se=0.013068316969818292,
            low=0.003830889698,
            high=0.055057750991)
stopifnot(
  abs(as.numeric(fit$b)-expect["estimate"]) < 1e-8,
  abs(as.numeric(fit$se)-expect["se"]) < 1e-8,
  abs(as.numeric(fit$ci.lb)-expect["low"]) < 1e-7,
  abs(as.numeric(fit$ci.ub)-expect["high"]) < 1e-7,
  abs(as.numeric(fit$QE)-0.8596926775315366) < 1e-8,
  abs(as.numeric(fit$tau2)) < 1e-10,
  abs(as.numeric(fe$b)-as.numeric(fit$b)) < 1e-10,
  abs(as.numeric(fe$se)-as.numeric(fit$se)) < 1e-10
)

# Verify that the browser's exact equal-effect weighted formula matches native R
# for every 2+ study selection without manufacturing new trial outcomes.
n_checked <- 0L
for (mask in 1:(2^nrow(dat)-1L)) {
  take <- which(as.logical(intToBits(mask)[seq_len(nrow(dat))]))
  if(length(take) < 2L) next
  v <- as.numeric(dat$vi[take]); y <- as.numeric(dat$yi[take])
  w <- 1/v
  browser_rd <- sum(w*y)/sum(w)
  browser_se <- sqrt(1/sum(w))
  browser_q <- sum(w*(y-browser_rd)^2)
  native <- metafor::rma(yi, vi, data=dat[take,,drop=FALSE], method="FE")
  stopifnot(is.finite(browser_rd), is.finite(browser_se), browser_se>0,
            abs(as.numeric(native$b)-browser_rd) < 1e-9,
            abs(as.numeric(native$se)-browser_se) < 1e-9,
            abs(as.numeric(native$QE)-browser_q) < 1e-8)
  n_checked <- n_checked+1L
}
stopifnot(n_checked == 57L)
cat(sprintf("PASS: real Hine six-row source, full REML RD benchmark, and %d selected-subset common-effect R oracles.\n", n_checked))
cat(sprintf("Native packages: R %s; metadat %s; metafor %s\n",
            getRversion(), as.character(packageVersion("metadat")), as.character(packageVersion("metafor"))))
cat("Boundary: reproduces a 1989/1999 archival teaching object, not a new current clinical evidence review.\n")
