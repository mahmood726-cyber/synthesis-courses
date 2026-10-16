# Reproduce archival selected-subset and full-dataset Peto equal-effects ORs.
# Requires installed R packages: metadat and metafor. Not a clinical recommendation.
library(metadat)
library(metafor)
d <- metadat::dat.egger2001
stopifnot(nrow(d) == 16L, identical(as.integer(d$id), 1:16))
s <- subset(d, id %in% c(1,2,3,6,14,16))
stopifnot(nrow(s)==6L,
          identical(as.integer(s$id), c(1L,2L,3L,6L,14L,16L)),
          identical(as.integer(s$ai),c(1L,9L,2L,1L,90L,2216L)),
          identical(as.integer(s$ci),c(2L,23L,7L,9L,118L,2103L)))
fit <- function(x) {
  m <- metafor::rma.peto(ai=ai,n1i=n1i,ci=ci,n2i=n2i,data=x)
  c(OR=exp(as.numeric(coef(m))),lower=exp(m$ci.lb),upper=exp(m$ci.ub))
}
near <- function(x,y,tol) all(is.finite(x) & abs(x-y)<tol)
a <- fit(subset(s,id!=16)); b <- fit(s)
# The Research Studio's four retrospective year-cutoff snapshots use the
# SAME six archived records, in teaching-year order, not actual registered
# year-specific systematic reviews. Verify every revealed numerical estimate.
teaching_ids <- c(1L,2L,3L,6L,14L,16L)
snapshots <- lapply(c(3L,4L,5L,6L), function(n) fit(subset(s, id %in% teaching_ids[seq_len(n)])))
targets <- list(
 c(0.365388498371,0.196665562913,0.678861884941),
 c(0.315338477301,0.180380510143,0.551269952543),
 c(0.622306235403,0.482840768907,0.802055409484),
 c(1.027995495150,0.967911363111,1.091809413882))
stopifnot(all(vapply(seq_along(snapshots),
  function(i) near(snapshots[[i]],targets[[i]],1e-6), logical(1))))
cat("PASS: 1986/1989/1992/1995 classroom snapshot Peto estimates and intervals.\n")
cat("R environment: ", R.version.string, "; metadat ", as.character(packageVersion("metadat")),
    "; metafor ", as.character(packageVersion("metafor")), "\n", sep="")

stopifnot(near(a,c(0.6223062354,0.4828407689,0.8020554095),1e-5),
          near(b,c(1.0279954951,0.9679113631,1.0918094139),1e-5))
# Replicate the real chronological analysis snapshots documented by metadat.
early7 <- fit(subset(d,id %in% 1:7))
early8 <- fit(subset(d,id %in% c(1:7,14)))
stopifnot(near(early7,c(0.45,0.28,0.71),0.011),
          near(early8,c(0.65,0.51,0.82),0.011))
full15 <- fit(subset(d,id!=16)); full16 <- fit(d)
# Full-dataset comparators are rounded as printed on the official metadat reference page.
stopifnot(near(full15,c(0.55,0.44,0.68),0.011),
          near(full16,c(1.01,0.95,1.07),0.011))
print(rbind(classroom_five=a,classroom_six=b,early_seven=early7,early_plus_LIMIT2=early8,reference_fifteen=full15,reference_sixteen=full16))
cat('PASS: selected 5/6-trial and full 15/16-trial reference Peto comparisons.\n')
